import "server-only";
import { getPrisma } from "@/backend/database/prisma";
import type { OrderStatus } from "@/generated/prisma/enums";

const transitions: Record<OrderStatus, OrderStatus[]> = {
  PENDING: ["CONFIRMED", "CANCELLED"], CONFIRMED: ["PROCESSING", "CANCELLED"],
  PROCESSING: ["SHIPPED", "CANCELLED"], SHIPPED: ["DELIVERED"],
  DELIVERED: ["REFUNDED"], CANCELLED: [], REFUNDED: [],
};

export async function changeOrderStatus(id: string, status: OrderStatus, actorId: string, note: string) {
  return getPrisma().$transaction(async (tx) => {
    const old = await tx.order.findUniqueOrThrow({ where: { id }, include: { items: true, payments: true } });
    if (status === old.status) return { old, order: old };
    if (!transitions[old.status].includes(status)) throw new Error("تغییر وضعیت سفارش مجاز نیست.");
    if (["CONFIRMED", "PROCESSING", "SHIPPED", "DELIVERED"].includes(status)) {
      const paid = old.payments.filter(payment => payment.status === "SUCCESS").reduce((sum, payment) => sum + Number(payment.amount), 0);
      if (paid !== Number(old.totalAmount) || (old.twoStagePayment && (!["DEPOSIT", "BALANCE"].every(stage => old.payments.some(payment => payment.stage === stage && payment.status === "SUCCESS"))))) throw new Error("ابتدا هر دو مرحلهٔ پرداخت و تسویهٔ کامل را تأیید کنید.");
    }
    if (status === "CANCELLED" || status === "SHIPPED") {
      for (const item of old.items) {
        if (!item.productId) continue;
        const changed = await tx.inventory.updateMany({
          where: { productId: item.productId, reserved: { gte: item.quantity }, ...(status === "SHIPPED" ? { quantity: { gte: item.quantity } } : {}) },
          data: { reserved: { decrement: item.quantity }, ...(status === "SHIPPED" ? { quantity: { decrement: item.quantity } } : {}) },
        });
        if (changed.count !== 1) throw new Error("موجودی رزرو شده با سفارش سازگار نیست؛ بررسی ادمین لازم است.");
        if (status === "SHIPPED") await tx.product.update({ where: { id: item.productId }, data: { stock: { decrement: item.quantity } } });
      }
    }
    const order = await tx.order.update({ where: { id }, data: { status, statusHistory: { create: { fromStatus: old.status, toStatus: status, note, actorId } } } });
    if (status === "CANCELLED") {
      await tx.payment.updateMany({ where: { orderId: id, status: { in: ["PENDING", "PROCESSING"] } }, data: { status: "CANCELLED" } });
      await tx.couponUsage.deleteMany({ where: { orderId: id } });
    }
    if (status === "SHIPPED") await tx.shipment.updateMany({ where: { orderId: id }, data: { status: "SHIPPED", shippedAt: new Date() } });
    if (status === "DELIVERED") await tx.shipment.updateMany({ where: { orderId: id }, data: { status: "DELIVERED", deliveredAt: new Date() } });
    return { old, order };
  }, { isolationLevel: "Serializable" });
}

export async function expireUnpaidOrders() {
  const cutoff = new Date(Date.now() - 24 * 3600_000);
  const orders = await getPrisma().order.findMany({ where: { status: "PENDING", createdAt: { lt: cutoff }, receipts: { none: { status: { in: ["PENDING", "APPROVED"] } } }, payments: { none: { status: "SUCCESS" } } }, take: 100, select: { id: true } });
  for (const order of orders) {
    await getPrisma().$transaction(async (tx) => {
      const current = await tx.order.findFirst({ where: { id: order.id, status: "PENDING", receipts: { none: { status: { in: ["PENDING", "APPROVED"] } } }, payments: { none: { status: "SUCCESS" } } }, include: { items: true } });
      if (!current) return;
      for (const item of current.items) {
        if (!item.productId) continue;
        const result = await tx.inventory.updateMany({ where: { productId: item.productId, reserved: { gte: item.quantity } }, data: { reserved: { decrement: item.quantity } } });
        if (result.count !== 1) throw new Error("Cannot release inconsistent reservation.");
      }
      await tx.order.update({ where: { id: current.id }, data: { status: "CANCELLED", statusHistory: { create: { fromStatus: "PENDING", toStatus: "CANCELLED", note: "مهلت ۲۴ ساعته ارسال رسید به پایان رسید." } } } });
      await tx.payment.updateMany({ where: { orderId: current.id, status: { in: ["PENDING", "PROCESSING"] } }, data: { status: "CANCELLED" } });
      await tx.couponUsage.deleteMany({ where: { orderId: current.id } });
    }, { isolationLevel: "Serializable" });
  }
}
