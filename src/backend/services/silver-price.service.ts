import "server-only";
import type { MarketQuote } from "./market-price.service";

const SILVER_URL =
  process.env.SILVER_PRICE_API_URL ??
  "https://api.noghresea.ir/api/market/getSilverPrice";

const FETCH_TIMEOUT_MS = 8_000;

function parseNumber(v: unknown): number {
  const n = Number(
    String(v ?? "")
      .replace(/[٬,]/g, "")
      .replace(/[۰-۹]/g, (d) => String("۰۱۲۳۴۵۶۷۸۹".indexOf(d)))
  );
  return Number.isFinite(n) ? n : 0;
}

async function fetchWithCookieChallenge(url: string): Promise<Response> {
  const headers: Record<string, string> = {
    Accept: "application/json",
    "User-Agent": "LaFemme-Market-Service/1.3",
  };

  const first = await fetch(url, {
    headers,
    redirect: "manual",
    signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
  });

  if (first.status >= 200 && first.status < 300) {
    return first;
  }

  if (first.status === 307 || first.status === 302 || first.status === 301) {
    const cookies = first.headers.get("set-cookie");
    if (cookies) {
      const cookieHeader = cookies
        .split(/,(?=[^;])/g)
        .map((c) => c.split(";")[0].trim())
        .join("; ");

      const location = first.headers.get("location") ?? url;
      return fetch(location, {
        headers: { ...headers, Cookie: cookieHeader },
        signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
      });
    }
  }

  return first;
}

export async function getSilverQuote(): Promise<MarketQuote> {
  const stale: MarketQuote = {
    metal: "SILVER",
    price: 0,
    priceToman: 0,
    priceRial: 0,
    change24h: 0,
    source: "noghresea.ir",
    updatedAt: new Date().toISOString(),
    stale: true,
  };

  try {
    const res = await fetchWithCookieChallenge(SILVER_URL);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);

    const payload = (await res.json()) as Record<string, unknown>;

    const rawPrice = parseNumber(payload.price);
    const change = parseNumber(payload.change24h ?? payload.changePercent);

    if (rawPrice <= 0) throw new Error("invalid silver price");

    // noghresea.ir returns price per gram in thousands of Rial (same unit as talasea.ir gold)
    const priceToman = Math.round(rawPrice * 1000);

    return {
      metal: "SILVER",
      price: priceToman,
      priceToman,
      priceRial: priceToman * 10,
      change24h: change,
      source: "noghresea.ir",
      updatedAt: new Date().toISOString(),
      stale: false,
    };
  } catch {
    return stale;
  }
}
