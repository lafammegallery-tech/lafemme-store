/** Bounded, deterministic comparison search; not a forecast or an exact optimiser. */
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
  const normalized = input.replace(/[۰-۹]/g, d => String("۰۱۲۳۴۵۶۷۸۹".indexOf(d)))
    .replace(/[٠-٩]/g, d => String("٠١٢٣٤٥٦٧٨٩".indexOf(d))).replace(/[,٬\s]/g, "");
  return /^\d{1,13}$/.test(normalized) ? Number(normalized) : NaN;
}

type State = { total: number; gold: number; silver: number; count: number; quantities: number[] };
type Goal = "weight" | "budget" | "flexible";
const digits = new Intl.NumberFormat("fa-IR", { maximumFractionDigits: 3 });
const money = new Intl.NumberFormat("fa-IR", { maximumFractionDigits: 0 });

export function eligibleInvestmentProducts(products: InvestmentProduct[], mode: InvestmentMode) {
  return products.filter(p => (mode === "mixed" || p.type === mode)
    && Number.isSafeInteger(p.price) && p.price > 0 && Number.isSafeInteger(p.stock) && p.stock > 0
    && Number.isFinite(p.weightValue) && p.weightValue > 0);
}

export function buildInvestmentPlans(products: InvestmentProduct[], budget: number, mode: InvestmentMode): InvestmentPlan[] {
  if (!Number.isSafeInteger(budget) || budget <= 0 || budget > MAX_INVESTMENT_BUDGET) return [];
  const catalog = eligibleInvestmentProducts(products, mode).filter(p => p.price <= budget)
    .sort((a, b) => a.type.localeCompare(b.type) || a.id.localeCompare(b.id));
  if (!catalog.length) return [];
  const weight = (s: State) => mode === "silver" ? s.silver : s.gold;
  const compare = (goal: Goal) => (a: State, b: State): number => {
    // In mixed mode every strategy first preserves the gold allocation.
    const priority = mode === "mixed" ? b.gold - a.gold : 0;
    if (priority) return priority;
    if (goal === "budget") return b.total - a.total || weight(b) - weight(a) || a.count - b.count;
    if (goal === "flexible") return Math.min(3, b.count) - Math.min(3, a.count) || weight(b) - weight(a) || b.total - a.total || a.count - b.count;
    return weight(b) - weight(a) || b.total - a.total || a.count - b.count;
  };
  const candidates = new Map<string, State>();
  for (const goal of ["weight", "budget", "flexible"] as const) {
    let states: State[] = [{ total: 0, gold: 0, silver: 0, count: 0, quantities: catalog.map(() => 0) }];
    catalog.forEach((product, index) => {
      let remaining = Math.min(product.stock, Math.floor(budget / product.price));
      // Binary stock bundles avoid iterating once per unit for large inventories.
      for (let size = 1; remaining > 0; size *= 2) {
        const quantity = Math.min(size, remaining);
        remaining -= quantity;
        const expanded = [...states];
        for (const state of states) {
          const total = state.total + product.price * quantity;
          if (total > budget) continue;
          const quantities = [...state.quantities];
          quantities[index] += quantity;
          expanded.push({ total, quantities, count: state.count + quantity,
            gold: state.gold + (product.type === "gold" ? product.weightValue * quantity : 0),
            silver: state.silver + (product.type === "silver" ? product.weightValue * quantity : 0) });
        }
        const unique = [...new Map(expanded.map(s => [s.quantities.join(","), s])).values()];
        // Keep inexpensive partial combinations too: they may admit a later product.
        const ranked = unique.sort(compare(goal)).slice(0, 192);
        const inexpensive = [...unique].sort((a, b) => a.total - b.total).slice(0, 64);
        states = [...new Map([...ranked, ...inexpensive].map(s => [s.quantities.join(","), s])).values()];
      }
    });
    for (const state of states.filter(s => s.count > 0)) candidates.set(state.quantities.join(","), state);
  }
  const selected = new Set<string>();
  const plans: InvestmentPlan[] = [];
  for (const goal of ["weight", "budget", "flexible"] as const) {
    const state = [...candidates.values()].filter(s => !selected.has(s.quantities.join(","))).sort(compare(goal))[0];
    if (!state) continue;
    const key = state.quantities.join(",");
    selected.add(key);
    const items = catalog.flatMap((product, i) => state.quantities[i] ? [{ product, quantity: state.quantities[i] }] : []);
    const title = goal === "weight" ? "تمرکز بر وزن" : goal === "budget" ? "استفاده از بودجه" : "انتخاب جایگزین";
    let reason = goal === "weight"
      ? `در جست‌وجوی ترکیب‌های موجود، این گزینه با تمرکز بر وزن ${mode === "silver" ? "نقره" : state.gold > 0 ? "طلا" : "نقره"} انتخاب شده است.`
      : goal === "budget"
        ? `این ترکیب ${money.format(state.total)} تومان از بودجه را به شمش تبدیل می‌کند و ${money.format(budget - state.total)} تومان باقی می‌گذارد.`
        : `این ترکیب، انتخاب متفاوتی از محصولات قابل خرید در محدودهٔ بودجهٔ شماست.`;
    if (state.count > 1) reason += ` با ${digits.format(state.count)} قطعهٔ جداگانه، برای فروش بخشی از دارایی لازم نیست همهٔ آن را یکجا بفروشید؛ شرایط بازخرید را جداگانه بررسی کنید.`;
    if (state.gold > 0 && state.silver > 0) reason += ` در کنار ${digits.format(state.gold)} گرم طلا، ${digits.format(state.silver)} گرم نقره هم در بودجه جای گرفته است.`;
    else if (mode === "mixed") reason += ` این پیشنهاد فقط شامل ${state.gold > 0 ? "طلا" : "نقره"} است؛ حالت «طلا و نقره» الزاماً به معنی حضور هر دو فلز در همهٔ ترکیب‌ها نیست.`;
    plans.push({ key, title, reason, items, total: state.total, remaining: budget - state.total,
      goldWeight: state.gold, silverWeight: state.silver, count: state.count });
  }
  return plans;
}
