import { splitPayment } from "./staged-payment";

export interface PaymentPolicyValues {
  twoStageEnabled: boolean;
  depositPercent: number;
  thresholdAmount: number;
  revision: number;
}

export interface PaymentAmountRange {
  minimumAmount: number;
  maximumAmount: number | null;
}

export const DEFAULT_PAYMENT_POLICY: PaymentPolicyValues = {
  twoStageEnabled: true, depositPercent: 10, thresholdAmount: 60_000_000, revision: 0,
};

/** Minimum inclusive, maximum exclusive. Empty maximum means no upper limit. */
export function matchesPaymentRange(total: number, range: PaymentAmountRange) {
  return Number.isSafeInteger(total) && total >= 0 && total >= range.minimumAmount && (range.maximumAmount === null || total < range.maximumAmount);
}

export function paymentPlan(total: number, policy: PaymentPolicyValues) {
  if (!Number.isSafeInteger(total) || total <= 0) throw new Error("مبلغ نهایی سفارش باید عدد صحیح و بیشتر از صفر باشد.");
  const twoStage = policy.twoStageEnabled && total >= policy.thresholdAmount;
  const amounts = twoStage ? splitPayment(total, policy.depositPercent) : { deposit: 0, balance: 0 };
  return { twoStage, depositPercent: twoStage ? policy.depositPercent : null, ...amounts, payableNow: twoStage ? amounts.deposit : total };
}

export function parsePaymentInteger(value: unknown, label: string) {
  const normalized = String(value ?? "").trim().replace(/[۰-۹]/g, x => String("۰۱۲۳۴۵۶۷۸۹".indexOf(x))).replace(/[٠-٩]/g, x => String("٠١٢٣٤٥٦٧٨٩".indexOf(x))).replace(/[,٬\s]/g, "");
  if (!/^\d+$/.test(normalized)) throw new Error(`${label} باید عدد صحیح و نامنفی باشد.`);
  const number = Number(normalized);
  if (!Number.isSafeInteger(number)) throw new Error(`${label} از محدودهٔ مجاز بزرگ‌تر است.`);
  return number;
}

export function parsePaymentRange(minimum: unknown, maximum: unknown): PaymentAmountRange {
  const minimumAmount = parsePaymentInteger(minimum, "حداقل مبلغ");
  const maximumAmount = String(maximum ?? "").trim() ? parsePaymentInteger(maximum, "سقف مبلغ") : null;
  if (maximumAmount !== null && maximumAmount <= minimumAmount) throw new Error("سقف مبلغ باید بزرگ‌تر از حداقل مبلغ باشد؛ برای نامحدود خالی بگذارید.");
  return { minimumAmount, maximumAmount };
}
