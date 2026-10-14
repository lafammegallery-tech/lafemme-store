import { test } from "node:test";
import assert from "node:assert/strict";
import { parseCustomPrices } from "../src/backend/services/custom-price-parser";

const now = Date.parse("2026-10-14T15:22:53Z");
const payload = () => ({ prices: [
  { asset: "GOLD_18K", buy_price: 1126600000, sell_price: 1, buy_price_gram: 2, available: true, unit_code: "MITHGAL", updated_at: "2026-10-14T15:22:48Z" },
  { asset: "SILVER_1000G_NADIR", buy_price: 5110000000, sell_price: 1, available: true, unit_code: "PIECE", updated_at: "2026-10-14T15:22:48Z" },
] });
test("uses exact buy assets, converts rial to toman and applies gold purity once", () => {
  const result = parseCustomPrices(payload(), now);
  assert.equal(Math.round(result.gold.priceToman * 995 / 750), Math.round(1126600000 / 4.3318 * 995 / 750 / 10));
  assert.equal(result.silver.priceToman, 511000);
});
test("rejects unavailable, outdated, duplicate, missing and invalid prices", () => {
  const unavailable = payload(); unavailable.prices[0].available = false;
  assert.throws(() => parseCustomPrices(unavailable, now));
  assert.throws(() => parseCustomPrices(payload(), now + 16 * 60_000));
  const duplicate = payload(); duplicate.prices.push(duplicate.prices[0]);
  assert.throws(() => parseCustomPrices(duplicate, now));
  const invalid = payload(); invalid.prices[0].buy_price = -1;
  assert.throws(() => parseCustomPrices(invalid, now));
  assert.throws(() => parseCustomPrices({ prices: [] }, now));
});
