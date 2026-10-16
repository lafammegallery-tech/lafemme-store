import "server-only";
import { getPrisma } from "@/backend/database/prisma";
import { assertStage } from "./staged-payment.service";

export async function reviewPaymentReceipt(id: string, approved: boolean, actorId: string, note: string | null) {
  return getPrisma().$transaction(async (tx) => {
    const receipt = await tx.paymentReceipt.findUniqueOrThrow({ where: { id } });
    if (receipt.status !== "PENDING") throw new Error("این رسید قبلاً بررسی شده است.");
    const order = await tx.order.findUniqueOrThrow({ where: { id: receipt.orderId }, include: { payments: true, receipts: true } });
    const payment = assertStage(order, receipt.stage, order.paymentRevision);
    const bundle = order.receipts.filter(r => r.stage === receipt.stage && r.status === "PENDING");
    const now = new Date();
    await tx.paymentReceipt.updateMany({ where: { id: { in: bundle.map(r => r.id) }, status: "PENDING" }, data: { status: approved ? "APPROVED" : "REJECTED", note, reviewedBy: actorId, reviewedAt: now } });
    await tx.payment.update({ where: { id: payment.id }, data: approved ? { status: "SUCCESS", paidAt: new Date(), failureReason: null } : { status: "PENDING", paidAt: null, failureReason: note ?? "رسید رد شد." } });
    const final = approved && receipt.stage !== "DEPOSIT";
    await tx.order.update({ where: { id: receipt.orderId }, data: {
      paymentRevision: { increment: 1 },
      ...(final ? { status: "CONFIRMED" } : {}),
      statusHistory: { create: { fromStatus: "PENDING", toStatus: final ? "CONFIRMED" : "PENDING", note: receipt.stage === "DEPOSIT" ? (approved ? "تأیید اولیه: پیش‌پرداخت ۱۰٪ تأیید شد؛ در انتظار تعیین مقصد و تسویه مانده." : `رسیدهای پیش‌پرداخت رد شد. ${note ?? ""}`) : (approved ? "تأیید نهایی: همهٔ رسیدهای این مرحله و تسویه تأیید شد." : `رسیدهای تسویه رد شد. ${note ?? ""}`), actorId } },
    } });
    await tx.auditLog.create({ data: { actorId, action: "RECEIPT_BUNDLE_REVIEW", entityType: "Order", entityId: receipt.orderId, newData: { stage: receipt.stage, approved, note, receiptIds: bundle.map(r => r.id), amount: String(payment.amount) } } });
    return receipt.orderId;
  }, { isolationLevel: "Serializable" });
}
