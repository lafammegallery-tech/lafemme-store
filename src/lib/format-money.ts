/** Display whole toman while preserving precision in underlying market calculations. */
export function formatMoney(value: number, locale = "fa-IR"): string {
  return new Intl.NumberFormat(locale, { useGrouping: true, maximumFractionDigits: 0 }).format(value);
}

/** String-based input formatting: grouping must never round stored monetary values. */
export function normalizeMoneyInput(value: string): string {
  return value.replace(/[۰-۹]/g, d => String("۰۱۲۳۴۵۶۷۸۹".indexOf(d)))
    .replace(/[٠-٩]/g, d => String("٠١٢٣٤٥٦٧٨٩".indexOf(d)))
    .replace(/[,٬\s]/g, "").replace(/٫/g, ".");
}

export function formatMoneyInput(value: string): string {
  const raw = normalizeMoneyInput(value);
  if (!/^\d*(?:\.\d*)?$/.test(raw) || !raw) return raw;
  const [integer, fraction] = raw.split(".");
  const grouped = (integer || "0").replace(/^0+(?=\d)/, "").replace(/\B(?=(\d{3})+(?!\d))/g, "٬");
  return (grouped + (fraction !== undefined ? `٫${fraction}` : "")).replace(/\d/g, d => "۰۱۲۳۴۵۶۷۸۹"[Number(d)]);
}

const ones = ["", "یک", "دو", "سه", "چهار", "پنج", "شش", "هفت", "هشت", "نه", "ده", "یازده", "دوازده", "سیزده", "چهارده", "پانزده", "شانزده", "هفده", "هجده", "نوزده"];
const tens = ["", "", "بیست", "سی", "چهل", "پنجاه", "شصت", "هفتاد", "هشتاد", "نود"];
const hundreds = ["", "صد", "دویست", "سیصد", "چهارصد", "پانصد", "ششصد", "هفتصد", "هشتصد", "نهصد"];
const scales = ["", "هزار", "میلیون", "میلیارد", "تریلیون", "هزار تریلیون"];

export function moneyToPersianWords(value: number): string {
  if (!Number.isSafeInteger(value) || value < 0) return "";
  if (!value) return "صفر تومان";
  const parts: string[] = [];
  let index = 0;
  while (value > 0) {
    const group = value % 1000;
    if (group) {
      const words: string[] = [];
      if (group >= 100) words.push(hundreds[Math.floor(group / 100)]);
      const rest = group % 100;
      if (rest >= 20) {
        words.push(tens[Math.floor(rest / 10)]);
        if (rest % 10) words.push(ones[rest % 10]);
      } else if (rest) words.push(ones[rest]);
      parts.unshift(`${words.join(" و ")}${scales[index] ? ` ${scales[index]}` : ""}`);
    }
    value = Math.floor(value / 1000);
    index++;
  }
  return `${parts.join(" و ")} تومان`;
}
