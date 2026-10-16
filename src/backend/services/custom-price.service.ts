import "server-only";
import { parseCustomPricesPartial } from "./custom-price-parser";
import type { MarketQuote, MetalKind } from "./market-price.service";
import { MARKET_REFRESH_MS } from "@/lib/market-refresh";

let cached: ReturnType<typeof parseCustomPricesPartial> | null = null;
let expiresAt = 0;
let pending: Promise<ReturnType<typeof parseCustomPricesPartial>> | null = null;
async function loadPrices() {
  if (cached && Date.now() < expiresAt) return cached;
  if (pending) return pending;
  pending = (async () => {
    const key = process.env.MARKET_PRICE_API_KEY;
    if (!key) throw new Error("MARKET_PRICE_API_KEY is required");
    const url = new URL(process.env.MARKET_PRICE_API_URL ?? "https://arbitrage.aectest.ir/simulation/api/public/v1/prices");
    if (url.protocol !== "https:") throw new Error("Price API requires HTTPS");
    const response = await fetch(url, { headers: { Accept: "application/json", "X-API-Key": key }, cache: "no-store", redirect: "error", signal: AbortSignal.timeout(8000) });
    if (!response.ok) throw new Error("Price API unavailable");
    cached = parseCustomPricesPartial(await response.json());
    expiresAt = Date.now() + MARKET_REFRESH_MS;
    return cached;
  })();
  try { return await pending; } finally { pending = null; }
}

export async function getCustomQuote(metal: MetalKind): Promise<MarketQuote> {
  const source = "arbitrage.aectest.ir";
  try {
    const prices = await loadPrices();
    const quote = metal === "GOLD" ? prices.gold : prices.silver;
    if (!quote) throw new Error(`Price unavailable for ${metal}`);
    return { metal, price: quote.priceToman, priceToman: quote.priceToman, priceRial: quote.priceToman * 10, change24h: 0, source, updatedAt: quote.updatedAt, stale: false };
  } catch {
    return { metal, price: 0, priceToman: 0, priceRial: 0, change24h: 0, source, updatedAt: new Date().toISOString(), stale: true };
  }
}
