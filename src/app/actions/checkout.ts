"use server";
import { redirect } from "next/navigation";
import { getSession } from "@/backend/auth/session";
import { getCurrentCart } from "@/backend/services/cart.service";
import { getPrisma } from "@/backend/database/prisma";
import { evaluateCoupon } from "@/backend/services/coupon.service";

export type CheckoutState = { error?: string };

/** این تابع سفارش را از سبد خرید می‌سازد و پرداخت را ثبت می‌کند. */
export async function checkoutAction(
  _: CheckoutState,
  formData: FormData,
): Promise<CheckoutState> {
  const session = await getSession();
  const cart = await getCurrentCart();
  if (!cart?.items.length) redirect("/cart");

  const customerName = String(formData.get("name") ?? "").trim().replace(/[<>]/g, "").slice(0, 120);
  const customerPhone = String(formData.get("phone") ?? "").replace(/\D/g, "");
  const province = String(formData.get("province") ?? "").trim();
  const city = String(formData.get("city") ?? "").trim();
  const addressLine = String(formData.get("address") ?? "").trim();

  // اعتبارسنجی اطلاعات فرم
  if (!customerName) return { error: "نام و نام خانوادگی را وارد کنید." };
  if (!/^09\d{9}$/.test(customerPhone)) return { error: "شماره موبایل معتبر وارد کنید." };
  if (!province || !city || !addressLine) return { error: "اطلاعات آدرس ناقص است." };

  const prisma = getPrisma();

  let orderNumber: string;

  try {
    const order = await prisma.$transaction(async (tx) => {
      // بررسی موجودی محصولات
      for (const item of cart.items) {
        const inventory = await tx.inventory.findFirst({ where: { productId: item.productId } });
        if (inventory && inventory.quantity - inventory.reserved < item.quantity) {
          throw new Error(`موجودی "${item.product.name}" کافی نیست.`);
        }
        if (inventory) {
          await tx.inventory.update({
            where: { id: inventory.id },
            data: { reserved: { increment: item.quantity } },
          });
        }
      }

      const subtotal = cart.items.reduce((s, i) => s + Number(i.unitPrice) * i.quantity, 0);
      const applied = await evaluateCoupon(
        String(formData.get("coupon") ?? ""),
        subtotal,
        session?.userId,
      );
      const discountAmount = applied?.discount ?? 0;
      const shippingAmount = subtotal >= 100_000_000 || applied?.freeShipping ? 0 : 500_000;
      const totalAmount = subtotal - discountAmount + shippingAmount;

      // شماره سفارش یکتا با timestamp و random برای جلوگیری از تکرار
      const rand = Math.floor(Math.random() * 10000).toString().padStart(4, "0");
      const num = `LF-${Date.now()}-${rand}`;

      const created = await tx.order.create({
        data: {
          userId: session?.userId ?? null,
          orderNumber: num,
          customerName,
          customerPhone,
          customerEmail: String(formData.get("email") ?? "") || null,
          subtotal,
          discountAmount,
          shippingAmount,
          totalAmount,
          shippingAddress: { province, city, addressLine, postalCode: String(formData.get("postalCode") ?? "") },
          customerNote: String(formData.get("note") ?? "") || null,
          items: {
            create: cart.items.map((i) => ({
              productId: i.productId,
              variantId: i.variantId,
              productName: i.product.name,
              variantName: i.variant?.title,
              sku: i.product.sku,
              unitPrice: i.unitPrice,
              quantity: i.quantity,
              totalPrice: Number(i.unitPrice) * i.quantity,
            })),
          },
          payments: { create: { amount: totalAmount, method: "ONLINE", status: "PENDING", gateway: "NOT_CONFIGURED" } },
          shipment: { create: { status: "PENDING" } },
          statusHistory: { create: { toStatus: "PENDING", note: "سفارش ایجاد شد." } },
        },
      });

      if (applied) {
        await tx.couponUsage.create({
          data: {
            couponId: applied.coupon.id,
            // userId اختیاری است — برای مهمان null می‌ماند
            userId: session?.userId ?? null,
            orderId: created.id,
            amount: discountAmount,
          },
        });
      }

      await tx.cartItem.deleteMany({ where: { cartId: cart.id } });
      return created;
    });

    orderNumber = order.orderNumber;
  } catch (err) {
    // خطاهای شناخته‌شده را به UI برمی‌گردانیم
    const message = err instanceof Error ? err.message : "خطا در ثبت سفارش. دوباره تلاش کنید.";
    return { error: message };
  }

  redirect(`/order-success?order=${orderNumber}`);
}
