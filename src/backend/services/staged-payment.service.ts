import "server-only";
import { getPrisma } from "@/backend/database/prisma";
import type { Prisma, PaymentStage } from "@/generated/prisma/client";
import { destinationSnapshot, MAX_RECEIPT_FILES, parseDestination, splitPayment } from "@/lib/staged-payment";

export type PaymentOrder = Prisma.OrderGetPayload<{ include: { payments: true; receipts: true } }>;

export function currentPayment(order: PaymentOrder) {
  if (order.status !== "PENDING") return null;
  if (!order.twoStagePayment) return order.payments.find(p => p.stage === "FULL" && p.method === "CARD_TO_CARD" && ["PENDING", "PROCESSING"].includes(p.status)) ?? null;
  const deposit = order.payments.find(p => p.stage === "DEPOSIT");
  return deposit?.status === "SUCCESS" ? order.payments.find(p => p.stage === "BALANCE" && ["PENDING", "PROCESSING"].includes(p.status)) ?? null : deposit ?? null;
}

export function assertStage(order: PaymentOrder, stage: PaymentStage, revision: number) {
  if (order.deletedAt || order.status !== "PENDING" || revision !== order.paymentRevision) throw new Error("وضعیت سفارش تغییر کرده؛ صفحه را تازه کنید.");
  const payment = currentPayment(order);
  if (!payment || payment.stage !== stage || payment.method !== "CARD_TO_CARD" || !["PENDING", "PROCESSING"].includes(payment.status)) throw new Error("این مرحله قابل پرداخت نیست.");
  if (order.twoStagePayment) {
    const amounts = splitPayment(Number(order.totalAmount));
    const deposit = order.payments.find(p => p.stage === "DEPOSIT");
    const balance = order.payments.find(p => p.stage === "BALANCE");
    if (order.payments.length !== 2 || !deposit || !balance || deposit.method !== "CARD_TO_CARD" || balance.method !== "CARD_TO_CARD" || Number(deposit.amount) !== amounts.deposit || Number(balance.amount) !== amounts.balance) throw new Error("مبالغ پرداخت سفارش نیاز به بررسی دارد.");
  } else if (order.payments.length !== 1 || Number(payment.amount) !== Number(order.totalAmount)) throw new Error("رکورد پرداخت سفارش نیاز به بررسی دارد.");
  return payment;
}

export async function saveBalanceDestination(orderId: string, revision: number, input: Parameters<typeof parseDestination>[0], actorId: string) {
  const destination = parseDestination(input);
  return getPrisma().$transaction(async tx => {
    const order = await tx.order.findUniqueOrThrow({ where: { id: orderId }, include: { payments: true, receipts: true } });
    if (!order.twoStagePayment) throw new Error("این سفارش پرداخت دو مرحله‌ای ندارد.");
    const payment = assertStage(order, "BALANCE", revision);
    if (order.receipts.some(r => r.stage === "BALANCE" && r.status === "PENDING")) throw new Error("ابتدا رسیدهای تسویهٔ در انتظار را بررسی کنید؛ مقصد فعلاً قفل است.");
    await tx.payment.update({ where: { id: payment.id }, data: { metadata: destination } });
    await tx.order.update({ where: { id: order.id }, data: { paymentRevision: { increment: 1 } } });
    await tx.auditLog.create({ data: { actorId, action: "BALANCE_DESTINATION_UPDATE", entityType: "Order", entityId: order.id, oldData: destinationSnapshot(payment.metadata), newData: destination } });
    return order;
  }, { isolationLevel: "Serializable" });
}

/** All images form a single review bundle. Either every image is accepted or none is. */
export async function submitReceiptBundle(orderId: string, stage: PaymentStage, revision: number, urls: string[]) {
  if (!urls.length || urls.length > MAX_RECEIPT_FILES || new Set(urls).size !== urls.length) throw new Error("بین ۱ تا ۱۰ تصویر انتخاب کنید.");
  return getPrisma().$transaction(async tx => {
    const order = await tx.order.findUniqueOrThrow({ where: { id: orderId }, include: { payments: true, receipts: true } });
    const payment = assertStage(order, stage, revision);
    if (order.receipts.some(r => r.stage === stage && ["PENDING", "APPROVED"].includes(r.status))) throw new Error("رسیدهای این مرحله در انتظار بررسی یا تأیید شده‌اند.");
    const destination = destinationSnapshot(payment.metadata);
    if (stage === "BALANCE" && !destination.cardNumber && !destination.iban) throw new Error("ابتدا مدیر باید مقصد واریز مانده را تعیین کند.");
    await tx.paymentReceipt.createMany({ data: urls.map(imageUrl => ({ orderId, stage, imageUrl })) });
    await tx.payment.update({ where: { id: payment.id }, data: { status: "PROCESSING" } });
    await tx.order.update({ where: { id: orderId }, data: { paymentRevision: { increment: 1 } } });
  }, { isolationLevel: "Serializable" });
}
