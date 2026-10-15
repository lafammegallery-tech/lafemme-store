import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { MARKET_REFRESH_MS } from "../src/lib/market-refresh";
import { faqItems } from "../src/data/faq";

const source = (path: string) => readFileSync(new URL(`../src/${path}`, import.meta.url), "utf8");

test("both price widgets use one-minute polling without change indicators or cadence text", () => {
  assert.equal(MARKET_REFRESH_MS, 60_000);
  for (const name of ["MarketTicker", "MarketOverview"]) {
    const text = source(`components/market/${name}.tsx`);
    assert.match(text, /useMarketData\(\)/);
    assert.doesNotMatch(text, /change24h|ChangeTag|market-change|market-time|▲|▼|۵ دقیقه|پنج دقیقه|به‌روزرسانی خودکار/);
  }
  const hook = source("components/market/useMarketData.ts");
  assert.match(hook, /setInterval\([^\n]*MARKET_REFRESH_MS/);
  assert.match(hook, /clearInterval/);
  assert.match(hook, /pending\?\.abort/);
  assert.match(hook, /stale: true/);
});

test("market endpoint does not layer a stale HTTP cache over the minute-long quote cache", () => {
  const endpoint = source("app/api/market/route.ts");
  assert.match(endpoint, /dynamic = "force-dynamic"/);
  assert.match(endpoint, /"Cache-Control": "no-store"/);
  assert.doesNotMatch(endpoint, /s-maxage|stale-while-revalidate/);
  assert.match(source("backend/services/custom-price.service.ts"), /Date.now\(\) \+ MARKET_REFRESH_MS/);
});

test("published policies and FAQs replace prototype copy and cover actual purchasing", () => {
  assert.equal(faqItems.length, 14);
  assert.equal(new Set(faqItems.map(item => item.id)).size, faqItems.length);
  const faq = faqItems.map(item => `${item.title} ${item.content}`).join(" ");
  for (const keyword of ["کارت‌به‌کارت", "رسید", "مهمان", "ارسال", "بازپرداخت", "محاسبه‌گر", "حریم خصوصی"]) assert.ok(faq.includes(keyword));
  for (const page of ["privacy", "terms"]) {
    const text = source(`app/${page}/page.tsx`);
    assert.match(text, /href="\/contact"/);
    assert.match(text, /آخرین بازنگری/);
    assert.doesNotMatch(text, /هیچ اطلاعاتی به Backend|همه قیمت‌ها و موجودی‌ها آزمایشی|هیچ پرداختی در فرانت‌اند/);
  }
  assert.doesNotMatch(faq, /بعد از اتصال سیستم|گواهی رسمی هستند|بسته‌بندی امن و بیمه شده/);
});
