import { test } from "node:test";
import assert from "node:assert/strict";
import { formatMoney, formatMoneyInput, normalizeMoneyInput, moneyToPersianWords } from "../src/lib/format-money";

test("money groups every three digits including editable Persian and Arabic input", () => {
  assert.equal(formatMoney(100000000), "۱۰۰٬۰۰۰٬۰۰۰");
  assert.equal(formatMoney(1234567, "en-US"), "1,234,567");
  for (const input of ["100000000", "۱۰۰٬۰۰۰٬۰۰۰", "١٠٠٠٠٠٠٠٠"]) {
    assert.equal(formatMoneyInput(input), "۱۰۰٬۰۰۰٬۰۰۰");
    assert.equal(normalizeMoneyInput(formatMoneyInput(input)), "100000000");
  }
  assert.equal(formatMoneyInput(""), "");
  assert.equal(formatMoneyInput("12345.678901"), "۱۲٬۳۴۵٫۶۷۸۹۰۱");
  assert.equal(normalizeMoneyInput("۱۲٬۳۴۵٫۶۷۸۹۰۱"), "12345.678901");
});

test("whole toman amounts are written accurately in Persian", () => {
  assert.equal(moneyToPersianWords(0), "صفر تومان");
  assert.equal(moneyToPersianWords(100000000), "صد میلیون تومان");
  assert.equal(moneyToPersianWords(123456789), "صد و بیست و سه میلیون و چهارصد و پنجاه و شش هزار و هفتصد و هشتاد و نه تومان");
  assert.equal(moneyToPersianWords(1000000000000), "یک تریلیون تومان");
  for (const value of [NaN, -1, 1.5, Infinity]) assert.equal(moneyToPersianWords(value), "");
});
