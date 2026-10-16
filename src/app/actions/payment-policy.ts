"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/backend/auth/session";
import { getPrisma } from "@/backend/database/prisma";
import { getPaymentPolicy } from "@/backend/services/payment-policy.service";
import { parsePaymentInteger, parsePaymentRange } from "@/lib/payment-policy";

export type PaymentSettingsState = { error?: string; success?: string };

export async function savePaymentPolicyAction(_: PaymentSettingsState, form: FormData): Promise<PaymentSettingsState> {
  const session = await requireAdmin();
  try {
    const depositPercent = parsePaymentInteger(form.get("depositPercent"), "درصد پیش‌پرداخت");
    if (depositPercent < 1 || depositPercent > 99) throw new Error("درصد پیش‌پرداخت باید بین ۱ تا ۹۹ باشد.");
    const thresholdAmount = parsePaymentInteger(form.get("thresholdAmount"), "مرز پیش‌پرداخت");
    const revision = parsePaymentInteger(form.get("revision"), "نسخهٔ تنظیمات");
    const twoStageEnabled = form.get("twoStageEnabled") === "on";
    await getPrisma().$transaction(async tx => {
      const old = await getPaymentPolicy(tx);
      if (old.revision !== revision) throw new Error("تنظیمات توسط مدیر دیگری تغییر کرده؛ صفحه را تازه کنید.");
      const data = { twoStageEnabled, depositPercent, thresholdAmount, revision: revision + 1, updatedBy: session.userId };
      await tx.paymentPolicy.upsert({ where: { id: "global" }, create: { id: "global", ...data }, update: data });
      await tx.auditLog.create({ data: { actorId: session.userId, action: "PAYMENT_POLICY_UPDATE", entityType: "PaymentPolicy", entityId: "global", oldData: { ...old }, newData: data } });
    }, { isolationLevel: "Serializable" });
    revalidatePath("/admin/payment-methods");
    revalidatePath("/checkout");
    return { success: "تنظیمات ذخیره شد؛ فقط سفارش‌های جدید از این قانون استفاده می‌کنند." };
  } catch (error) { return { error: error instanceof Error ? error.message : "ذخیرهٔ تنظیمات انجام نشد." }; }
}

export async function savePaymentRangeAction(_: PaymentSettingsState, form: FormData): Promise<PaymentSettingsState> {
  const session = await requireAdmin();
  try {
    const id = String(form.get("id") ?? "");
    const range = parsePaymentRange(form.get("minimumAmount"), form.get("maximumAmount"));
    await getPrisma().$transaction(async tx => {
      const old = await tx.paymentMethodConfig.findUniqueOrThrow({ where: { id } });
      await tx.paymentMethodConfig.update({ where: { id }, data: range });
      await tx.auditLog.create({ data: { actorId: session.userId, action: "PAYMENT_METHOD_RANGE_UPDATE", entityType: "PaymentMethodConfig", entityId: id, oldData: { minimumAmount: String(old.minimumAmount), maximumAmount: old.maximumAmount === null ? null : String(old.maximumAmount) }, newData: { ...range } } });
    }, { isolationLevel: "Serializable" });
    revalidatePath("/admin/payment-methods");
    revalidatePath("/checkout");
    return { success: "بازهٔ مبلغ این روش ذخیره شد." };
  } catch (error) { return { error: error instanceof Error ? error.message : "ذخیرهٔ بازه انجام نشد." }; }
}
