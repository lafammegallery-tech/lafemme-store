import "server-only";

export type MetalKind = "GOLD" | "SILVER";
export interface MarketQuote {
  metal: MetalKind;
  price: number;
  change24h: number;
  source: string;
  updatedAt: string;
  stale: boolean;
}

function parseNumber(value: unknown): number {
  const normalized = String(value ?? "")
    .replace(/[٬,]/g, "")
    .replace(/[۰-۹]/g, (d) => String("۰۱۲۳۴۵۶۷۸۹".indexOf(d)));
  const parsed = typeof value === "number" ? value : Number(normalized);
  return Number.isFinite(parsed) ? parsed : 0;
}

function deepFindNumber(payload: unknown, keys: string[]): number {
  if (!payload || typeof payload !== "object") return 0;
  const object = payload as Record<string, unknown>;
  for (const key of keys) {
    if (key in object) {
      const value = parseNumber(object[key]);
      if (value > 0) return value;
    }
  }
  for (const value of Object.values(object)) {
    if (value && typeof value === "object") {
      const result = deepFindNumber(value, keys);
      if (result > 0) return result;
    }
  }
  return 0;
}

/**
 * وقتی یک provider شکست می‌خورد، تا مدتی از تلاش دوباره صرف‌نظر می‌کنیم (circuit breaker ساده).
 * بدون این، هر بار که provider در دسترس نباشد (مثلاً noghresea.ir پشت محافظت ضد-ربات Arvan Cloud)
 * هر رندر صفحه چند ثانیه منتظر timeout آن fetch می‌ماند — چون fetchهای ناموفق برخلاف fetchهای
 * موفق در Next.js کش نمی‌شوند.
 */
const providerCooldownUntil = new Map<string, number>();
const FAILURE_COOLDOWN_MS = 60_000;
const FETCH_TIMEOUT_MS = 4_000;

export async function fetchProviderQuote(metal: MetalKind, url: string, source: string): Promise<MarketQuote> {
  const staleQuote = (): MarketQuote => ({
    metal,
    price: 0,
    change24h: 0,
    source,
    updatedAt: new Date().toISOString(),
    stale: true,
  });

  const cooldownUntil = providerCooldownUntil.get(source);
  if (cooldownUntil && Date.now() < cooldownUntil) return staleQuote();

  try {
    const response = await fetch(url, {
      headers: { Accept: "application/json", "User-Agent": "LaFemme-Market-Service/1.3" },
      next: { revalidate: 300 },
      signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
    });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const payload: unknown = await response.json();
    const price = deepFindNumber(payload, ["price", "value", "currentPrice", "finalPrice", "geram18", "gram18", "silverPrice"]);
    const change = deepFindNumber(payload, ["changePercent", "change24h", "percent", "change"]);
    if (price <= 0) throw new Error("invalid market price");
    providerCooldownUntil.delete(source);
    return { metal, price, change24h: change, source, updatedAt: new Date().toISOString(), stale: false };
  } catch {
    providerCooldownUntil.set(source, Date.now() + FAILURE_COOLDOWN_MS);
    return staleQuote();
  }
}

export async function getMarketQuotes() {
  const [{ getGoldQuote }, { getSilverQuote }] = await Promise.all([
    import("./gold-price.service"),
    import("./silver-price.service"),
  ]);
  const [gold, silver] = await Promise.all([getGoldQuote(), getSilverQuote()]);
  return { gold, silver };
}

export function calculateProductPrice(params: {
  weightInGrams: number;
  marketPricePerGram: number;
  purityFactor?: number;
  premiumPercent?: number;
  fixedPremium?: number;
  fallbackPrice?: number;
}): number {
  const { weightInGrams, marketPricePerGram, purityFactor = 1, premiumPercent = 0, fixedPremium = 0, fallbackPrice = 0 } = params;
  if (marketPricePerGram <= 0 || weightInGrams <= 0) return Math.max(0, Math.round(fallbackPrice));
  const metalValue = weightInGrams * marketPricePerGram * purityFactor;
  return Math.max(0, Math.round(metalValue + metalValue * (premiumPercent / 100) + fixedPremium));
}

export async function persistMarketQuotes(): Promise<{ saved: number; skipped: boolean }> {
  if (!process.env.DATABASE_URL) return { saved: 0, skipped: true };
  const { getPrisma } = await import("@/backend/database/prisma");
  const quotes = await getMarketQuotes();
  const valid = [quotes.gold, quotes.silver].filter((q) => q.price > 0);
  if (!valid.length) return { saved: 0, skipped: false };
  const prisma = getPrisma();
  await prisma.marketPrice.createMany({
    // پس از اجرای prisma generate این cast دیگر لازم نیست؛ برای سازگاری ZIP با client قبلی نگه داشته شده است.
    data: valid.map((q) => ({
      metalType: q.metal,
      price: q.price,
      changePercent: q.change24h,
      source: q.source,
      isStale: q.stale,
      recordedAt: new Date(q.updatedAt),
    })) as never,
    skipDuplicates: true,
  });
  return { saved: valid.length, skipped: false };
}
