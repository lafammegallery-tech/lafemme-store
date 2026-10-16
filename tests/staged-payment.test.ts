import { test } from "node:test";
import assert from "node:assert/strict";
import { destinationSnapshot, parseDestination, splitPayment } from "../src/lib/staged-payment";

test("10% deposit rounds up to whole toman and remainder sums exactly", () => {
  assert.deepEqual(splitPayment(100_000_000), { deposit: 10_000_000, balance: 90_000_000 });
  assert.deepEqual(splitPayment(1001), { deposit: 101, balance: 900 });
  for (const total of [10, 11, 19, 99999999, Number.MAX_SAFE_INTEGER]) {
    const { deposit, balance } = splitPayment(total);
    assert.equal(deposit + balance, total);
    assert.ok(deposit > 0 && balance > 0);
  }
  for (const total of [-1, 0, 9, 10.5, NaN, Infinity, Number.MAX_SAFE_INTEGER + 1]) assert.throws(() => splitPayment(total));
});

test("per-order destination accepts Persian cards and validates Iranian IBAN checksum", () => {
  const data = { cardNumber: "۶۰۳۷-۹۹۱۲ ۳۴۵۶۷۸۹۱", iban: "", cardHolder: "صاحب حساب", bankName: "بانک" };
  assert.equal(parseDestination(data).cardNumber, "6037991234567891");
  const iban = "IR062960000000100324200001";
  assert.equal(parseDestination({ ...data, cardNumber: "", iban: iban.toLowerCase() }).iban, iban);
  assert.equal(parseDestination({ ...data, cardNumber: "", iban: iban.slice(2) }).iban, iban);
  assert.throws(() => parseDestination({ ...data, cardNumber: "", iban: "IR072960000000100324200001" }));
  for (const override of [{ cardNumber: "" }, { cardNumber: "123" }, { cardHolder: " " }]) assert.throws(() => parseDestination({ ...data, ...override }));
  assert.deepEqual(destinationSnapshot(null), { cardNumber: "", iban: "", cardHolder: "", bankName: "" });
});
