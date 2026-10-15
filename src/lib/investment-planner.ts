import { formatMoney, normalizeMoneyInput } from "./format-money";

export type InvestmentMode = "gold" | "silver" | "mixed";
export interface InvestmentProduct {
  id: string;
  name: string;
  href: string;
  imageSrc: string;
  type: "gold" | "silver";
  price: number;
  stock: number;
  weightValue: number;
  purity: string;
}
export interface InvestmentPlan {
  key: string;
  title: string;
  reason: string;
  items: Array<{ product: InvestmentProduct; quantity: number }>;
  total: number;
  remaining: number;
  goldWeight: number;
  silverWeight: number;
  count: number;
}
export const MAX_INVESTMENT_BUDGET = 1_000_000_000_000;

export function parseInvestmentBudget(input: string): number {
  const normalized = normalizeMoneyInput(input);
  return /^\d{1,13}$/.test(normalized) ? Number(normalized) : NaN;
}

const digits = new Intl.NumberFormat("fa-IR", { maximumFractionDigits: 3 });

export function eligibleInvestmentProducts(products: InvestmentProduct[], mode: InvestmentMode) {
  return products.filter(p => (mode === "mixed" || p.type === mode)
    && Number.isSafeInteger(p.price) && p.price > 0 && Number.isSafeInteger(p.stock) && p.stock > 0
    && Number.isFinite(p.weightValue) && p.weightValue > 0);
}

/** Heaviest first, never replace an affordable large bar with a stack of small ones.
 * Alternatives remove small tails, not large anchor bars. This is a denomination
 * policy rather than a maximum-weight/maximum-spend knapsack optimisation.
 */
export function buildInvestmentPlans(products: InvestmentProduct[], budget: number, mode: InvestmentMode): InvestmentPlan[] {
  if (!Number.isSafeInteger(budget) || budget <= 0 || budget > MAX_INVESTMENT_BUDGET) return [];
  const catalog = eligibleInvestmentProducts(products, mode).filter(p => p.price <= budget)
    .sort((a, b) => (mode === "mixed" ? a.type.localeCompare(b.type) : 0)
      || b.weightValue - a.weightValue || a.price - b.price || a.id.localeCompare(b.id));
  if (!catalog.length) return [];
  type Item = InvestmentPlan["items"][number];
  function fill(limit: number, selected: InvestmentProduct[]): Item[] {
    const items: Item[] = [];
    for (const product of selected) {
      const quantity = Math.min(product.stock, Math.floor(limit / product.price));
      if (quantity <= 0) continue;
      items.push({ product, quantity });
      limit -= product.price * quantity;
    }
    return items;
  }
  const plans: InvestmentPlan[] = [];
  const signatures = new Set<string>();
  function add(items: Item[], title: string, explanation: string) {
    if (!items.length || plans.length >= 3) return;
    // Different SKUs of the same metal/size are not meaningful extra suggestions.
    const sizes = new Map<string, number>();
    for (const item of items) {
      const size = `${item.product.type}:${item.product.weightValue}:${item.product.purity}`;
      sizes.set(size, (sizes.get(size) ?? 0) + item.quantity);
    }
    const key = [...sizes].sort(([a], [b]) => a.localeCompare(b)).map(([size, count]) => `${size}=${count}`).join("|");
    if (signatures.has(key)) return;
    const total = items.reduce((sum, i) => sum + i.product.price * i.quantity, 0);
    const count = items.reduce((sum, i) => sum + i.quantity, 0);
    const metalWeight = (metal: "gold" | "silver") => Math.round(items.reduce((sum, i) => sum + (i.product.type === metal ? i.quantity * i.product.weightValue : 0), 0) * 1e6) / 1e6;
    const goldWeight = metalWeight("gold"), silverWeight = metalWeight("silver");
    const largest = items[0].product;
    let reason = `${explanation} این ترکیب از شمش ${digits.format(largest.weightValue)} گرمی شروع شده و شامل ${formatMoney(count)} قطعه است؛ به‌جای خرد کردن خرید به تعداد زیادی شمش سبک، وزن‌های بزرگ‌تر انتخاب شده‌اند.`;
    if (items.length > 1) reason += " وزن‌های کوچک‌تر فقط برای تکمیل ترکیب پس از شمش‌های سنگین‌تر استفاده شده‌اند.";
    reason += ` مبلغ باقی‌مانده ${formatMoney(budget - total)} تومان است.`;
    if (goldWeight > 0 && silverWeight > 0) reason += ` وزن طلا ${digits.format(goldWeight)} گرم و نقره ${digits.format(silverWeight)} گرم است.`;
    else if (mode === "mixed") reason += ` این گزینه تک‌فلزی است؛ حضور هر دو فلز به بودجه و موجودی بستگی دارد.`;
    signatures.add(key);
    plans.push({ key, title, reason, items, total, remaining: budget - total, goldWeight, silverWeight, count });
  }
  const primary = fill(budget, catalog);
  add(primary, "شمش‌های سنگین‌تر", "ابتدا سنگین‌ترین شمش قابل خرید و سپس وزن‌های بعدی در بودجه انتخاب شده‌اند.");

  if (mode === "mixed" && !primary.some(i => i.product.type === "silver")) {
    const gold = catalog.filter(p => p.type === "gold");
    const silver = catalog.filter(p => p.type === "silver");
    const silverMinimum = silver.length ? Math.min(...silver.map(p => p.price)) : Infinity;
    const goldItems = fill(budget - silverMinimum, gold);
    if (goldItems.length) {
      const rest = budget - goldItems.reduce((sum, i) => sum + i.product.price * i.quantity, 0);
      const silverItems = fill(rest, silver);
      if (silverItems.length) add([...goldItems, ...silverItems], "ترکیب دو فلز", "در این سناریو، بخشی از بودجه برای حضور هر دو فلز کنار گذاشته شده و در هر فلز، شمش‌های سنگین‌تر زودتر انتخاب شده‌اند.");
    }
  }
  // Compact scenarios deliberately leave the fine-grained remainder unspent.
  if (primary.length > 1) add(primary.slice(0, -1), "قطعات کمتر", "با حذف ریزترین بخش خرید، تعداد قطعات کمتر شده و مبلغ بیشتری برای شما باقی می‌ماند.");
  if (primary.length > 1) add(primary.slice(0, 1), "فقط وزن اصلی", "این سناریو فقط وزن اصلی خرید را نگه می‌دارد و بودجهٔ باقی‌مانده را صرف قطعات ریز نمی‌کند.");
  return plans;
}
