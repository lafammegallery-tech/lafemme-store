import { test } from "node:test";
import assert from "node:assert/strict";
import { buildInvestmentPlans, parseInvestmentBudget, MAX_INVESTMENT_BUDGET } from "../src/lib/investment-planner";
import type { InvestmentProduct, InvestmentMode } from "../src/lib/investment-planner";

const product = (id: string, type: "gold" | "silver", price: number, weightValue: number, stock = 4): InvestmentProduct => ({
  id, name: id, href: `/products/${id}`, imageSrc: "/image.png", type, price, weightValue, stock, purity: "995",
});
const catalog = [product("g1", "gold", 40, 1), product("g2", "gold", 75, 2), product("s1", "silver", 10, 5)];

test("accepts Persian/Arabic/grouped whole toman budgets, rejects invalid notation", () => {
  for (const text of ["۱۰۰٬۰۰۰٬۰۰۰", "100,000,000", "١٠٠٠٠٠٠٠٠", "100 000 000"]) assert.equal(parseInvestmentBudget(text), 100_000_000);
  for (const text of ["1e8", "100.5", "-100", "ریال", "", "۱۲٫۵"]) assert.ok(Number.isNaN(parseInvestmentBudget(text)));
});

test("plans respect budget, stock, metal filter, actual totals, and are distinct", () => {
  for (const mode of ["gold", "silver", "mixed"] as InvestmentMode[]) {
    for (const budget of [10, 39, 40, 89, 100, 149, 500]) {
      const plans = buildInvestmentPlans(catalog, budget, mode);
      assert.ok(plans.length <= 3);
      assert.equal(new Set(plans.map(p => p.key)).size, plans.length);
      for (const plan of plans) {
        assert.ok(plan.total <= budget && plan.total > 0);
        assert.equal(plan.total + plan.remaining, budget);
        assert.equal(plan.total, plan.items.reduce((sum, i) => sum + i.quantity * i.product.price, 0));
        assert.equal(plan.goldWeight, plan.items.reduce((sum, i) => sum + (i.product.type === "gold" ? i.quantity * i.product.weightValue : 0), 0));
        assert.ok(plan.reason.length > 40);
        for (const item of plan.items) {
          assert.ok(Number.isInteger(item.quantity) && item.quantity > 0 && item.quantity <= item.product.stock);
          if (mode !== "mixed") assert.equal(item.product.type, mode);
        }
      }
    }
  }
});

test("mixed mode preserves gold first then uses remainder for silver", () => {
  const plans = buildInvestmentPlans(catalog, 100, "mixed");
  assert.equal(plans[0].goldWeight, 2);
  assert.ok(plans[0].silverWeight > 0);
  assert.equal(plans[0].total, 100);
  assert.ok(plans.every(p => !p.reason.includes("اولویت") && !p.title.includes("اولویت")));
});

test("excludes unavailable and invalid products, handles low and invalid budgets", () => {
  const invalid = [product("zero", "gold", 0, 1), product("nostock", "gold", 20, 1, 0), product("badweight", "gold", 20, NaN)];
  assert.deepEqual(buildInvestmentPlans(invalid, 100, "gold"), []);
  assert.deepEqual(buildInvestmentPlans(catalog, 9, "mixed"), []);
  for (const budget of [0, -1, NaN, Infinity, 12.5, MAX_INVESTMENT_BUDGET + 1]) assert.deepEqual(buildInvestmentPlans(catalog, budget, "mixed"), []);
  const single = buildInvestmentPlans([product("one", "gold", 100, 1, 1)], 100, "gold");
  assert.equal(single.length, 1);
  assert.equal(single[0].remaining, 0);
});

test("mixed mode does not invent gold or silver if only one metal is affordable", () => {
  const silverOnly = buildInvestmentPlans(catalog, 25, "mixed");
  assert.equal(silverOnly[0].goldWeight, 0);
  assert.equal(silverOnly[0].silverWeight, 10);
});

test("large inventories stay bounded and deterministic", () => {
  const large = [product("g", "gold", 1_000_000, 1, 1_000_000), product("s", "silver", 100_000, 5, 1_000_000)];
  const first = buildInvestmentPlans(large, MAX_INVESTMENT_BUDGET, "mixed");
  assert.deepEqual(first, buildInvestmentPlans(large, MAX_INVESTMENT_BUDGET, "mixed"));
  assert.ok(first.length > 0 && first.every(p => p.total <= MAX_INVESTMENT_BUDGET));
});
