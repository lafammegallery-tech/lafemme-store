import "server-only";

export type MetalKind = "GOLD" | "SILVER";

export interface MarketQuote {
  metal: MetalKind;
  price: number;
  change24h: number;
  source: string;
  updatedAt: string;
  stale: boolean;
  isManual?: boolean;
  isFallback?: boolean;
}

export interface MarketQuotes {
  gold: MarketQuote;      // = gold750 for backward compat
  gold750: MarketQuote;   // 18k gold from API
  gold995: MarketQuote;   // = gold750 × (995/750), computed
  silver: MarketQuote;    // = silver999 for backward compat
  silver999: MarketQuote; // from API or fallback
  isManualMode: boolean;
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

async function getLastKnownPrice(metal: MetalKind): Promise<{ price: number; source: string; recordedAt: string }> {
  if (!process.env.DATABASE_URL) return { price: 0, source: "unknown", recordedAt: new Date().toISOString() };
  try {
    const { getPrisma } = await import("@/backend/database/prisma");
    const row = await getPrisma().marketPrice.findFirst({
      where: { metalType: metal, isStale: false, price: { gt: 0 } },
      orderBy: { recordedAt: "desc" },
    });
    return row
      ? { price: Number(row.price), source: row.source + " (ذخیره)", recordedAt: row.recordedAt.toISOString() }
      : { price: 0, source: "unknown", recordedAt: new Date().toISOString() };
  } catch {
    return { price: 0, source: "unknown", recordedAt: new Date().toISOString() };
  }
}

async function getManualSettings(): Promise<{ isManual: boolean; gold750?: number; silver999?: number }> {
  if (!process.env.DATABASE_URL) return { isManual: false };
  try {
    const { getPrisma } = await import("@/backend/database/prisma");
    const prisma = getPrisma() as unknown as { marketSettings?: { findUnique: (args: unknown) => Promise<unknown> } };
    if (!prisma.marketSettings?.findUnique) return { isManual: false };
    const settings = await prisma.marketSettings.findUnique({ where: { id: "global" } }) as {
      isManualMode: boolean;
      manualGold750: unknown;
      manualSilver999: unknown;
    } | null;
    if (!settings?.isManualMode) return { isManual: false };
    return {
      isManual: true,
      gold750: settings.manualGold750 ? Number(settings.manualGold750) : undefined,
      silver999: settings.manualSilver999 ? Number(settings.manualSilver999) : undefined,
    };
  } catch {
    return { isManual: false };
  }
}

export async function getMarketQuotes(): Promise<MarketQuotes> {
  const override = await getManualSettings();

  const [{ getGoldQuote }, { getSilverQuote }] = await Promise.all([
    import("./gold-price.service"),
    import("./silver-price.service"),
  ]);
  const [rawGold, rawSilver] = await Promise.all([getGoldQuote(), getSilverQuote()]);

  // Gold 750: from API or manual override
  let gold750Quote: MarketQuote;
  if (override.isManual && override.gold750) {
    gold750Quote = {
      metal: "GOLD",
      price: override.gold750,
      change24h: 0,
      source: "دستی",
      updatedAt: new Date().toISOString(),
      stale: false,
      isManual: true,
    };
  } else if (rawGold.stale || rawGold.price <= 0) {
    const fallback = await getLastKnownPrice("GOLD");
    gold750Quote = {
      metal: "GOLD",
      price: fallback.price,
      change24h: rawGold.change24h,
      source: fallback.source,
      updatedAt: fallback.recordedAt,
      stale: fallback.price <= 0,
      isFallback: fallback.price > 0,
    };
  } else {
    gold750Quote = rawGold;
  }

  // Gold 995: calculated from gold750
  const gold995Price = gold750Quote.price > 0 ? Math.round(gold750Quote.price * (995 / 750)) : 0;
  const gold995Quote: MarketQuote = {
    metal: "GOLD",
    price: gold995Price,
    change24h: gold750Quote.change24h,
    source: gold750Quote.isManual ? "دستی (محاسبه)" : "محاسبه از ۷۵۰",
    updatedAt: gold750Quote.updatedAt,
    stale: gold750Quote.stale,
    isManual: gold750Quote.isManual,
    isFallback: gold750Quote.isFallback,
  };

  // Silver 999: from API or manual override or DB fallback
  let silverQuote: MarketQuote;
  if (override.isManual && override.silver999) {
    silverQuote = {
      metal: "SILVER",
      price: override.silver999,
      change24h: 0,
      source: "دستی",
      updatedAt: new Date().toISOString(),
      stale: false,
      isManual: true,
    };
  } else if (rawSilver.stale || rawSilver.price <= 0) {
    const fallback = await getLastKnownPrice("SILVER");
    silverQuote = {
      metal: "SILVER",
      price: fallback.price,
      change24h: rawSilver.change24h,
      source: fallback.price > 0 ? fallback.source : rawSilver.source,
      updatedAt: fallback.price > 0 ? fallback.recordedAt : rawSilver.updatedAt,
      stale: fallback.price <= 0,
      isFallback: fallback.price > 0,
    };
  } else {
    silverQuote = rawSilver;
  }

  return {
    gold: gold750Quote,
    gold750: gold750Quote,
    gold995: gold995Quote,
    silver: silverQuote,
    silver999: silverQuote,
    isManualMode: override.isManual,
  };
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
  const valid = [quotes.gold750, quotes.silver999].filter((q) => q.price > 0 && !q.isFallback);
  if (!valid.length) return { saved: 0, skipped: false };
  const prisma = getPrisma();
  await prisma.marketPrice.createMany({
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
