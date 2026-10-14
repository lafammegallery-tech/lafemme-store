"use server";
import { redirect } from "next/navigation";
import { getSession } from "@/backend/auth/session";
import { getCurrentCart } from "@/backend/services/cart.service";
import { getPrisma } from "@/backend/database/prisma";
import { evaluateCoupon } from "@/backend/services/coupon.service";
import { getStorefrontProducts } from "@/backend/services/storefront-product.service";
import { grantGuestOrderAccess } from "@/backend/auth/order-access";
import { assertRateLimit } from "@/backend/security/rate-limit";

export type CheckoutState = { error?: string };

/** این تابع سفارش را از سبد خرید می‌سازد و پرداخت را ثبت می‌کند. */
export async function checkoutAction(
  _: CheckoutState,
  formData: FormData,
): Promise<CheckoutState> {
  const session = await getSession();
  const cart = await getCurrentCart();
  if (!cart?.items.length) redirect("/cart");
  try { assertRateLimit(`checkout:${cart.id}`, 5, 3600_000); }
  catch { return { error: "درخواست بیش از حد مجاز؛ کمی بعد تلاش کنید." }; }

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

  // روش پرداخت و ارسال انتخاب‌شده را از تنظیمات مدیر می‌خوانیم.
  const paymentMethodId = String(formData.get("paymentMethodId") ?? "").trim();
  const shippingMethodId = String(formData.get("shippingMethodId") ?? "").trim();
  const [paymentMethod, shippingMethod] = await Promise.all([
    paymentMethodId ? prisma.paymentMethodConfig.findFirst({ where: { id: paymentMethodId, isActive: true } }) : null,
    shippingMethodId ? prisma.shippingMethodConfig.findFirst({ where: { id: shippingMethodId, isActive: true } }) : null,
  ]);

  if (!paymentMethod || paymentMethod.type !== "CARD_TO_CARD" || !paymentMethod.cardNumber || paymentMethod.cardNumber === "6037991234567890") return { error: "روش کارت‌به‌کارت واقعی و معتبر انتخاب کنید؛ کارت نمونه قابل استفاده نیست." };
  if (!shippingMethod) return { error: "روش ارسال معتبر انتخاب کنید." };
  let orderNumber: string;
  let orderId: string;

  try {
    const products = await getStorefrontProducts();
    const pricedItems = cart.items.map((item) => {
      const product = products.find((entry) => entry.id === item.productId);
      if (!product || product.price <= 0 || !Number.isInteger(item.quantity) || item.quantity < 1) throw new Error("محصول یا قیمت سفارش معتبر نیست.");
      if (product.price !== Number(item.unitPrice)) throw new Error("قیمت محصول تغییر کرده؛ محصول را از سبد حذف و دوباره اضافه کنید.");
      return { ...item, unitPrice: product.price };
    });
    const order = await prisma.$transaction(async (tx) => {
      const currentItems = await tx.cartItem.findMany({ where: { cartId: cart.id } });
      if (currentItems.length !== pricedItems.length || pricedItems.some((item) => !currentItems.some((current) => current.id === item.id && current.quantity === item.quantity && Number(current.unitPrice) === item.unitPrice))) throw new Error("سبد تغییر کرده؛ صفحه را تازه کنید.");
      const activeProducts = await tx.product.count({ where: { id: { in: pricedItems.map((item) => item.productId) }, status: "ACTIVE", deletedAt: null } });
      if (activeProducts !== new Set(pricedItems.map((item) => item.productId)).size) throw new Error("یکی از محصولات دیگر قابل خرید نیست.");
      // بررسی موجودی محصولات
      for (const item of pricedItems) {
        const inventory = await tx.inventory.findFirst({ where: { productId: item.productId } });
        if (!inventory || inventory.quantity - inventory.reserved < item.quantity) {
          throw new Error(`موجودی "${item.product.name}" کافی نیست.`);
        }
        if (inventory) {
          const reserved = await tx.inventory.updateMany({
            where: { id: inventory.id, quantity: inventory.quantity, reserved: inventory.reserved },
            data: { reserved: { increment: item.quantity } },
          });
          if (reserved.count !== 1) throw new Error("موجودی تغییر کرد؛ دوباره تلاش کنید.");
        }
      }

      const subtotal = pricedItems.reduce((s, i) => s + i.unitPrice * i.quantity, 0);
      const applied = await evaluateCoupon(
        String(formData.get("coupon") ?? ""),
        subtotal,
        session?.userId,
        tx,
      );
      const discountAmount = applied?.discount ?? 0;
      // هزینه ارسال از روش انتخاب‌شده؛ در نبود انتخاب، مقدار پیش‌فرض قبلی حفظ می‌شود.
      const baseShipping = shippingMethod ? Number(shippingMethod.cost) : subtotal >= 100_000_000 ? 0 : 500_000;
      const shippingAmount = applied?.freeShipping ? 0 : baseShipping;
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
          shippingMethod: shippingMethod?.name ?? null,
          paymentMethodName: paymentMethod?.name ?? null,
          customerNote: String(formData.get("note") ?? "") || null,
          items: {
            create: pricedItems.map((i) => ({
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
          payments: { create: { amount: totalAmount, method: paymentMethod?.type ?? "ONLINE", status: "PENDING", gateway: paymentMethod?.type === "CARD_TO_CARD" ? "CARD_TO_CARD" : "NOT_CONFIGURED" } },
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
    }, { isolationLevel: "Serializable" });

    orderNumber = order.orderNumber;
    orderId = order.id;
  } catch (err) {
    // خطاهای شناخته‌شده را به UI برمی‌گردانیم
    const message = err instanceof Error ? err.message : "خطا در ثبت سفارش. دوباره تلاش کنید.";
    return { error: message };
  }

  if (!session) await grantGuestOrderAccess(orderId);
  redirect(`/order-success?order=${orderNumber}`);
}
