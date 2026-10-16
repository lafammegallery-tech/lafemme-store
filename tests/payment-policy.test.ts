import { test } from "node:test";
import assert from "node:assert/strict";
import { DEFAULT_PAYMENT_POLICY, matchesPaymentRange, parsePaymentInteger, parsePaymentRange, paymentPlan } from "../src/lib/payment-policy";
import { splitPayment } from "../src/lib/staged-payment";

test("default threshold: below 60m full; equal and above 60m staged", () => {
  assert.equal(paymentPlan(59_999_999, DEFAULT_PAYMENT_POLICY).twoStage, false);
  assert.equal(paymentPlan(59_999_999, DEFAULT_PAYMENT_POLICY).payableNow, 59_999_999);
  assert.deepEqual(paymentPlan(60_000_000, DEFAULT_PAYMENT_POLICY), { twoStage: true, depositPercent: 10, deposit: 6_000_000, balance: 54_000_000, payableNow: 6_000_000 });
  assert.equal(paymentPlan(60_000_001, DEFAULT_PAYMENT_POLICY).deposit, 6_000_001);
});

test("toggle, custom threshold, all-staged threshold and configurable percent", () => {
  assert.equal(paymentPlan(100_000_000, { ...DEFAULT_PAYMENT_POLICY, twoStageEnabled: false }).twoStage, false);
  const custom = { ...DEFAULT_PAYMENT_POLICY, thresholdAmount: 80_000_000, depositPercent: 25 };
  assert.equal(paymentPlan(70_000_000, custom).twoStage, false);
  assert.equal(paymentPlan(80_000_000, custom).deposit, 20_000_000);
  assert.equal(paymentPlan(1001, { ...custom, thresholdAmount: 0 }).deposit, 251);
  for (const percent of [1, 7, 25, 50, 99]) {
    for (const total of [1001, 60_000_001, Number.MAX_SAFE_INTEGER]) {
      const result = splitPayment(total, percent);
      assert.equal(result.deposit + result.balance, total);
      assert.ok(result.deposit > 0 && result.balance > 0);
    }
  }
  for (const percent of [0, 100, -1, 1.5, NaN, Infinity]) assert.throws(() => splitPayment(1001, percent));
  for (const total of [0, -1, NaN, Infinity, 1.5]) assert.throws(() => paymentPlan(total, custom));
});

test("payment-method amount intervals have no ambiguous boundary", () => {
  const low = { minimumAmount: 0, maximumAmount: 60_000_000 };
  const high = { minimumAmount: 60_000_000, maximumAmount: null };
  assert.ok(matchesPaymentRange(59_999_999, low));
  assert.ok(!matchesPaymentRange(60_000_000, low));
  assert.ok(matchesPaymentRange(60_000_000, high));
  assert.ok(!matchesPaymentRange(59_999_999, high));
  assert.ok(!matchesPaymentRange(NaN, high));
});

test("admin money parser supports grouped Persian amounts and rejects invalid ranges", () => {
  assert.equal(parsePaymentInteger("۶۰٬۰۰۰٬۰۰۰", "مبلغ"), 60_000_000);
  assert.equal(parsePaymentInteger("١٠", "درصد"), 10);
  assert.deepEqual(parsePaymentRange("0", ""), { minimumAmount: 0, maximumAmount: null });
  for (const value of ["", "-1", "1.2", "1e9", "NaN", "9007199254740992"]) assert.throws(() => parsePaymentInteger(value, "مبلغ"));
  assert.throws(() => parsePaymentRange("60", "60"));
  assert.throws(() => parsePaymentRange("60", "59"));
});
