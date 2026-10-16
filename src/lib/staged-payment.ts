export const STAGE_LABELS = { FULL: "پرداخت کامل", DEPOSIT: "پیش‌پرداخت ۱۰٪ — تأیید اولیه", BALANCE: "تسویه مانده — تأیید نهایی" };
export const MAX_RECEIPT_FILES = 10;
export const MAX_RECEIPT_BYTES = 30 * 1024 * 1024;

/** Whole toman, rounded up once for the deposit; the remainder sums exactly. */
export function splitPayment(total: number) {
  if (!Number.isSafeInteger(total) || total < 10) throw new Error("مبلغ سفارش برای پرداخت دو مرحله‌ای معتبر نیست.");
  const deposit = Number((BigInt(total) + BigInt(9)) / BigInt(10));
  return { deposit, balance: total - deposit };
}

const digits = (value: string) => value.replace(/[۰-۹]/g, x => String("۰۱۲۳۴۵۶۷۸۹".indexOf(x))).replace(/[٠-٩]/g, x => String("٠١٢٣٤٥٦٧٨٩".indexOf(x))).replace(/[\s-]/g, "");

export function parseDestination(input: { cardNumber: string; iban: string; cardHolder: string; bankName: string }) {
  const cardNumber = digits(input.cardNumber);
  const rawIban = digits(input.iban).toUpperCase();
  const iban = rawIban && !rawIban.startsWith("IR") ? `IR${rawIban}` : rawIban;
  if (!cardNumber && !iban) throw new Error("حداقل شماره کارت یا شبا را وارد کنید.");
  if (cardNumber && !/^\d{16}$/.test(cardNumber)) throw new Error("شماره کارت باید ۱۶ رقم باشد.");
  if (iban) {
    if (!/^IR\d{24}$/.test(iban)) throw new Error("شبای ایران باید IR و ۲۴ رقم باشد.");
    if (BigInt(iban.slice(4) + "1827" + iban.slice(2, 4)) % BigInt(97) !== BigInt(1)) throw new Error("شماره شبا معتبر نیست.");
  }
  const cardHolder = input.cardHolder.trim();
  const bankName = input.bankName.trim();
  if (!cardHolder || cardHolder.length > 120 || bankName.length > 100) throw new Error("نام صاحب حساب لازم است (حداکثر ۱۲۰ نویسه).");
  return { cardNumber, iban, cardHolder, bankName };
}

export function destinationSnapshot(value: unknown) {
  const data = value && typeof value === "object" ? value as Record<string, unknown> : {};
  return Object.fromEntries(["cardNumber", "iban", "cardHolder", "bankName"].map(key => [key, typeof data[key] === "string" ? data[key] : ""])) as Record<"cardNumber" | "iban" | "cardHolder" | "bankName", string>;
}
