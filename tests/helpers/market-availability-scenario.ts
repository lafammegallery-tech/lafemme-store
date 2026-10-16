import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { getPrisma } from "../../src/backend/database/prisma";
import { getMarketQuotes } from "../../src/backend/services/market-price.service";
import { getStorefrontProducts } from "../../src/backend/services/storefront-product.service";

const available = process.argv[2];
assert.ok(["GOLD", "SILVER", "NONE"].includes(available));
process.env.MARKET_PRICE_API_KEY = "isolated-test-key";
process.env.MARKET_PRICE_API_URL = "https://prices.invalid/test";
const originalFetch = globalThis.fetch;
let requests = 0;
globalThis.fetch = async () => {
  requests++;
  return Response.json({ prices: [
    { asset: "GOLD_18K", available: available === "GOLD", buy_price: 1_000_000_000, unit_code: "MITHGAL", updated_at: new Date().toISOString() },
    { asset: "SILVER_1000G_NADIR", available: available === "SILVER", buy_price: 5_000_000_000, unit_code: "PIECE", updated_at: new Date().toISOString() },
  ] });
};
async function main() {
  const db = getPrisma();
  const suffix = randomUUID();
  const category = await db.category.create({ data: { name: "Partial prices test", slug: suffix } });
  try {
    for (const metalType of ["GOLD", "SILVER"] as const) await db.product.create({ data: { categoryId: category.id, name: metalType, slug: `${suffix}-${metalType}`, metalType, weightValue: 2, purity: metalType === "GOLD" ? "995" : "999", price: 123, status: "ACTIVE", stock: 1 } });
    const quotes = await getMarketQuotes();
    assert.equal(quotes.gold750.stale, available !== "GOLD");
    assert.equal(quotes.gold995.stale, available !== "GOLD");
    assert.equal(quotes.silver999.stale, available !== "SILVER");
    const products = (await getStorefrontProducts()).filter(p => p.slug.startsWith(suffix));
    assert.equal(products.length, 2);
    for (const product of products) {
      const eligible = product.type.toUpperCase() === available;
      assert.equal(product.isLivePrice, eligible);
      if (eligible) {
        assert.ok(product.price > 123);
        const referencePrice = product.type === "gold" ? quotes.gold995.price : quotes.silver999.price;
        const existingPurityFactor = product.type === "gold" ? 1 : 999 / 995;
        assert.equal(product.price, Math.round(2 * referencePrice * existingPurityFactor));
      } else assert.equal(product.price, 123, "fallback amount is display-only, never purchase eligibility");
    }
    assert.equal(requests, 1, "both metals and subsequent reads share the cached partial response");
    console.log(`${available}: independent quotes, product eligibility and shared cache passed`);
  } finally {
    globalThis.fetch = originalFetch;
    await db.product.deleteMany({ where: { categoryId: category.id } });
    await db.category.delete({ where: { id: category.id } });
    await db.$disconnect();
  }
}

void main();
