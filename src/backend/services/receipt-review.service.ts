import "server-only";
import { getPrisma } from "@/backend/database/prisma";

export async function reviewPaymentReceipt(id: string, approved: boolean, actorId: string, note: string | null) {
  return getPrisma().$transaction(async (tx) => {
    const receipt = await tx.paymentReceipt.findUniqueOrThrow({ where: { id }, include: { order: true } });
    if (receipt.status !== "PENDING" || receipt.order.status !== "PENDING") throw new Error("این رسید قبلاً بررسی شده یا سفارش قابل پرداخت نیست.");
    const payments = await tx.payment.findMany({ where: { orderId: receipt.orderId } });
    // Never confirm an order without exactly one outstanding card transfer.
    if (payments.length !== 1) throw new Error("رکورد پرداخت سفارش نیاز به بررسی دارد.");
    const payment = payments[0];
    if (payment.method !== "CARD_TO_CARD" || !["PENDING", "PROCESSING"].includes(payment.status) || Number(payment.amount) !== Number(receipt.order.totalAmount)) throw new Error("پرداخت قابل بررسی نیست.");
    await tx.paymentReceipt.update({ where: { id }, data: { status: approved ? "APPROVED" : "REJECTED", note, reviewedBy: actorId, reviewedAt: new Date() } });
    await tx.payment.update({ where: { id: payment.id }, data: approved ? { status: "SUCCESS", paidAt: new Date(), failureReason: null } : { status: "PENDING", paidAt: null, failureReason: note ?? "رسید رد شد." } });
    if (approved) await tx.order.update({ where: { id: receipt.orderId }, data: { status: "CONFIRMED", statusHistory: { create: { fromStatus: "PENDING", toStatus: "CONFIRMED", note: "رسید کارت‌به‌کارت تأیید شد.", actorId } } } });
    return receipt.orderId;
  }, { isolationLevel: "Serializable" });
}
