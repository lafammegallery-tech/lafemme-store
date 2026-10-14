/** Display whole toman while preserving precision in underlying market calculations. */
export function formatMoney(value: number, locale = "fa-IR"): string {
  return new Intl.NumberFormat(locale, { maximumFractionDigits: 0 }).format(value);
}
