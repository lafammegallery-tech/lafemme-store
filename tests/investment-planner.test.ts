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
        assert.ok(Math.abs(plan.goldWeight - plan.items.reduce((sum, i) => sum + (i.product.type === "gold" ? i.quantity * i.product.weightValue : 0), 0)) < 1e-6);
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
  assert.equal(plans[0].total, 95);
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

test("mixed mode offers a genuine mixed alternative without weakening primary gold choice", () => {
  const items = [product("gold", "gold", 40, .1, 100), product("silver", "silver", 15, 1, 100)];
  const plans = buildInvestmentPlans(items, 80, "mixed");
  assert.equal(plans[0].goldWeight, .2);
  assert.ok(plans.some(p => p.goldWeight > 0 && p.silverWeight > 0));
});

test("equal weight prefers lower cost instead of needless budget consumption", () => {
  const plans = buildInvestmentPlans([product("small", "gold", 45, 1), product("large", "gold", 80, 2)], 90, "gold");
  assert.equal(plans[0].goldWeight, 2);
  assert.equal(plans[0].total, 80);
});

test("large inventories stay bounded and deterministic", () => {
  const large = [product("g", "gold", 1_000_000, 1, 1_000_000), product("s", "silver", 100_000, 5, 1_000_000)];
  const first = buildInvestmentPlans(large, MAX_INVESTMENT_BUDGET, "mixed");
  assert.deepEqual(first, buildInvestmentPlans(large, MAX_INVESTMENT_BUDGET, "mixed"));
  assert.ok(first.length > 0 && first.every(p => p.total <= MAX_INVESTMENT_BUDGET));
});

test("all single-metal scenarios retain an affordable 100g bar instead of ten 10g bars", () => {
  for (const metal of ["gold", "silver"] as const) {
    const items = [product("small", metal, 9_000_000, 10, 100), product("large", metal, 90_000_000, 100, 2)];
    const plans = buildInvestmentPlans(items, 100_000_000, metal);
    assert.ok(plans.length > 0);
    for (const plan of plans) {
      assert.equal(plan.items[0].product.id, "large");
      assert.ok(plan.count <= 2);
    }
    assert.ok(plans.some(p => p.count === 1 && p.items[0].product.weightValue === 100));
  }
});

test("descends through denominations, honours stock, and removes tails for compact alternatives", () => {
  const items = [product("100g", "silver", 70, 100, 1), product("20g", "silver", 18, 20, 4), product("5g", "silver", 5, 5, 100)];
  const plans = buildInvestmentPlans(items, 100, "silver");
  assert.deepEqual(plans[0].items.map(i => [i.product.id, i.quantity]), [["100g", 1], ["20g", 1], ["5g", 2]]);
  assert.ok(plans.every(p => p.items[0].product.id === "100g"));
  assert.deepEqual(plans.map(p => p.count), [4, 2, 1]);
});

test("does not invent alternatives by splitting the same weight into smaller bars", () => {
  const plans = buildInvestmentPlans([product("100g", "silver", 100, 100, 1), product("10g", "silver", 10, 10, 100)], 100, "silver");
  assert.equal(plans.length, 1);
  assert.equal(plans[0].count, 1);
});

test("new heavier products are used automatically only when affordable and available", () => {
  const existing = [product("100g", "silver", 60, 100, 5), product("10g", "silver", 7, 10, 100)];
  const added = product("new-250g", "silver", 140, 250, 2);
  assert.equal(buildInvestmentPlans(existing, 150, "silver")[0].items[0].product.id, "100g");
  const expanded = [...existing, added];
  assert.equal(buildInvestmentPlans(expanded, 150, "silver")[0].items[0].product.id, "new-250g");
  assert.equal(buildInvestmentPlans(expanded, 100, "silver")[0].items[0].product.id, "100g");
  assert.equal(buildInvestmentPlans([...existing, { ...added, stock: 0 }], 150, "silver")[0].items[0].product.id, "100g");
  assert.equal(buildInvestmentPlans([...expanded].reverse(), 150, "silver")[0].key, buildInvestmentPlans(expanded, 150, "silver")[0].key);
});

test("varied newly added denominations preserve budget, availability and descending weights", () => {
  let seed = 71;
  const random = (limit: number) => { seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0; return seed % limit; };
  for (let trial = 0; trial < 150; trial++) {
    const items = Array.from({ length: 20 }, (_, i) => product(`p${i}`, i % 2 ? "gold" : "silver", 1 + random(1000), (1 + random(1000)) / 10, random(20)));
    const budget = 1 + random(10000);
    for (const mode of ["gold", "silver", "mixed"] as const) {
      const plans = buildInvestmentPlans(items, budget, mode);
      assert.ok(plans.length <= 3);
      assert.equal(new Set(plans.map(p => p.key)).size, plans.length);
      for (const plan of plans) {
        assert.ok(plan.total > 0 && plan.total <= budget);
        assert.equal(plan.remaining, budget - plan.total);
        for (const [index, item] of plan.items.entries()) {
          assert.ok(item.quantity > 0 && item.quantity <= item.product.stock);
          assert.ok(mode === "mixed" || item.product.type === mode);
          const previous = plan.items[index - 1];
          if (previous?.product.type === item.product.type) assert.ok(previous.product.weightValue >= item.product.weightValue);
        }
      }
    }
  }
});
