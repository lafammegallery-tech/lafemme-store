"use server";
import { redirect } from "next/navigation";
import { getSession } from "@/backend/auth/session";
import { getCurrentCart } from "@/backend/services/cart.service";
import { getPrisma } from "@/backend/database/prisma";
import { evaluateCoupon } from "@/backend/services/coupon.service";

export async function checkoutAction(formData: FormData) {
  const session = await getSession();
  const cart = await getCurrentCart();
  if (!cart?.items.length) redirect("/cart");

  const customerName = String(formData.get("name") ?? "").trim().replace(/[<>]/g, "").slice(0, 120);
  const customerPhone = String(formData.get("phone") ?? "").replace(/\D/g, "");
  const province = String(formData.get("province") ?? "").trim();
  const city = String(formData.get("city") ?? "").trim();
  const addressLine = String(formData.get("address") ?? "").trim();

  if (!customerName || !/^09\d{9}$/.test(customerPhone) || !province || !city || !addressLine) {
    throw new Error("اطلاعات تسویه حساب ناقص است.");
  }

  const prisma = getPrisma();
  const order = await prisma.$transaction(async (tx) => {
    for (const item of cart.items) {
      const inventory = await tx.inventory.findFirst({ where: { productId: item.productId } });
      if (inventory && inventory.quantity - inventory.reserved < item.quantity) {
        throw new Error(`موجودی ${item.product.name} کافی نیست.`);
      }
      if (inventory) {
        await tx.inventory.update({ where: { id: inventory.id }, data: { reserved: { increment: item.quantity } } });
      }
    }

    const subtotal = cart.items.reduce((s, i) => s + Number(i.unitPrice) * i.quantity, 0);
    const applied = await evaluateCoupon(String(formData.get("coupon") ?? ""), subtotal, session?.userId);
    const discountAmount = applied?.discount ?? 0;
    const shippingAmount = subtotal >= 100_000_000 || applied?.freeShipping ? 0 : 1_500_000;
    const totalAmount = subtotal - discountAmount + shippingAmount;

    const created = await tx.order.create({
      data: {
        userId: session?.userId,
        orderNumber: `LF-${Date.now()}`,
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
        statusHistory: { create: { toStatus: "PENDING", note: "سفارش ایجاد شد و در انتظار پرداخت است." } },
      },
    });

    if (applied) {
      await tx.couponUsage.create({
        data: { couponId: applied.coupon.id, userId: session?.userId, orderId: created.id, amount: discountAmount },
      });
    }
    await tx.cartItem.deleteMany({ where: { cartId: cart.id } });
    return created;
  });

  redirect(`/order-success?order=${order.orderNumber}`);
}
