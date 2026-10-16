"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/backend/auth/session";
import { saveBalanceDestination } from "@/backend/services/staged-payment.service";
import { reviewPaymentReceipt } from "@/backend/services/receipt-review.service";
import { text } from "@/backend/security/validation";

export type PaymentActionState = { error?: string; success?: string };

function refreshOrder(id: string) {
  revalidatePath(`/admin/orders/${id}`);
  revalidatePath("/admin/payment-receipts");
  revalidatePath("/admin/orders");
  revalidatePath("/order-success");
  revalidatePath("/orders");
}

export async function saveDestinationAction(_: PaymentActionState, form: FormData): Promise<PaymentActionState> {
  const session = await requireAdmin();
  try {
    const revision = Number(form.get("revision"));
    if (!Number.isSafeInteger(revision) || revision < 0) throw new Error("صفحه را تازه کنید.");
    const order = await saveBalanceDestination(text(form.get("orderId"), 100), revision, {
      cardNumber: String(form.get("cardNumber") ?? ""), iban: String(form.get("iban") ?? ""),
      cardHolder: String(form.get("cardHolder") ?? ""), bankName: String(form.get("bankName") ?? ""),
    }, session.userId);
    refreshOrder(order.id);
    return { success: "مقصد تسویه فقط برای این سفارش ذخیره شد و مشتری می‌تواند آن را ببیند." };
  } catch (error) { return { error: error instanceof Error ? error.message : "ذخیره انجام نشد." }; }
}

export async function reviewBundleAction(_: PaymentActionState, form: FormData): Promise<PaymentActionState> {
  const session = await requireAdmin();
  try {
    const decision = form.get("decision");
    if (decision !== "approve" && decision !== "reject") throw new Error("تصمیم معتبر نیست.");
    const note = text(form.get("note"), 500);
    if (decision === "reject" && !note) throw new Error("دلیل رد را بنویسید تا مشتری بتواند اصلاح کند.");
    const orderId = await reviewPaymentReceipt(text(form.get("id"), 100), decision === "approve", session.userId, note || null);
    refreshOrder(orderId);
    return { success: decision === "approve" ? "تمام رسیدهای این مرحله تأیید شدند." : "مجموعه رسیدها رد شد؛ مشتری می‌تواند مجموعهٔ اصلاح‌شده ارسال کند." };
  } catch (error) { return { error: error instanceof Error ? error.message : "بررسی انجام نشد." }; }
}
