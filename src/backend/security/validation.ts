export function text(value: FormDataEntryValue | null, max = 250) {
  return String(value ?? "").trim().replace(/[<>]/g, "").slice(0, max);
}
export function phone(value: FormDataEntryValue | null) {
  const v = String(value ?? "").replace(/\D/g, "");
  if (!/^09\d{9}$/.test(v)) throw new Error("شماره موبایل معتبر نیست.");
  return v;
}
export function positiveInt(value: FormDataEntryValue | null, max = 1_000_000) {
  const n = Number(value);
  if (!Number.isInteger(n) || n < 0 || n > max) throw new Error("عدد واردشده معتبر نیست.");
  return n;
}
