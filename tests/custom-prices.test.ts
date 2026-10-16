import { test } from "node:test";
import assert from "node:assert/strict";
import { parseCustomPrices, parseCustomPricesPartial } from "../src/backend/services/custom-price-parser";
import { formatMoney } from "../src/lib/format-money";

test("money display has no decimals without changing conversion precision", () => {
  const quote = parseCustomPrices(payload(), now).gold.priceToman;
  assert.equal(formatMoney(quote, "en-US"), Math.round(quote).toLocaleString("en-US"));
  assert.equal(formatMoney(12345.678, "en-US"), "12,346");
  assert.notEqual(quote, Math.round(quote));
});

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

test("keeps an available metal when the other API asset is unavailable", () => {
  const payloadWithMissingSilver = payload();
  payloadWithMissingSilver.prices = payloadWithMissingSilver.prices.filter(row => row.asset !== "SILVER_1000G_NADIR");
  const result = parseCustomPricesPartial(payloadWithMissingSilver, now);
  assert.ok(result.gold);
  assert.equal(result.silver, null);
});

test("each metal fails closed independently for every invalid asset variant", () => {
  for (const index of [0, 1]) {
    const unavailableMetal = index === 0 ? "gold" : "silver";
    const availableMetal = index === 0 ? "silver" : "gold";
    const variants = [
      (data: ReturnType<typeof payload>) => { data.prices[index].available = false; },
      (data: ReturnType<typeof payload>) => { data.prices.splice(index, 1); },
      (data: ReturnType<typeof payload>) => { data.prices.push(data.prices[index]); },
      (data: ReturnType<typeof payload>) => { data.prices[index].buy_price = 0; },
      (data: ReturnType<typeof payload>) => { data.prices[index].buy_price = -1; },
      (data: ReturnType<typeof payload>) => { data.prices[index].unit_code = "WRONG"; },
      (data: ReturnType<typeof payload>) => { data.prices[index].updated_at = new Date(now - 16 * 60_000).toISOString(); },
      (data: ReturnType<typeof payload>) => { data.prices[index].updated_at = new Date(now + 61_000).toISOString(); },
    ];
    for (const mutate of variants) {
      const data = payload(); mutate(data);
      const parsed = parseCustomPricesPartial(data, now);
      assert.equal(parsed[unavailableMetal], null);
      assert.deepEqual(parsed[availableMetal], parseCustomPrices(payload(), now)[availableMetal]);
    }
  }
  assert.deepEqual(parseCustomPricesPartial({ prices: [] }, now), { gold: null, silver: null });
  for (const data of [null, {}, { prices: {} }]) assert.throws(() => parseCustomPricesPartial(data, now));
});
