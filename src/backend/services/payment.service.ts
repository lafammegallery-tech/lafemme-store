/* eslint-disable @typescript-eslint/no-explicit-any */
import { randomUUID } from "node:crypto";
import { getPrisma } from "@/backend/database/prisma";
export async function createMockPayment(orderId: string) {
  const prisma = getPrisma();
  const order = await prisma.order.findUnique({ where: { id: orderId }, include: { payments: true } });
  if (!order) throw new Error("سفارش پیدا نشد.");
  const existing = order.payments.find(p => p.status === "PENDING" || p.status === "PROCESSING");
  const payment = existing ?? await prisma.payment.create({ data: { orderId, amount: order.totalAmount, method: "ONLINE", gateway: "MOCK", status: "PROCESSING", authority: `MOCK-${randomUUID()}`, idempotencyKey: `order:${order.id}` } as any });
  return { payment, redirectUrl: `/api/payment/mock?authority=${payment.authority}` };
}
export async function verifyMockPayment(authority: string, success: boolean) {
  const prisma = getPrisma();
  return prisma.$transaction(async tx => {
    const payment = await tx.payment.findFirst({ where: { authority }, include: { order: true } });
    if (!payment) throw new Error("پرداخت پیدا نشد.");
    if (payment.status === "SUCCESS") return payment;
    if (!success) return tx.payment.update({ where: { id: payment.id }, data: { status: "FAILED", failureReason: "Mock gateway rejected payment" } });
    const updated = await tx.payment.update({ where: { id: payment.id }, data: { status: "SUCCESS", transactionId: `TRX-${Date.now()}`, paidAt: new Date() } });
    await tx.order.update({ where: { id: payment.orderId }, data: { status: "CONFIRMED", statusHistory: { create: { fromStatus: payment.order.status, toStatus: "CONFIRMED", note: "پرداخت آزمایشی با موفقیت تأیید شد." } } } as any });
    await tx.notification.createMany({ data: payment.order.userId ? [{ userId: payment.order.userId, type: "PAYMENT", title: "پرداخت موفق", message: `پرداخت سفارش ${payment.order.orderNumber} تأیید شد.` }] : [] });
    return updated;
  });
}
