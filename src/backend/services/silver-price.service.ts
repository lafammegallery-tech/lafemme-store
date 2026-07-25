import "server-only";
import { fetchProviderQuote, type MarketQuote } from "./market-price.service";

const SILVER_URL = process.env.SILVER_PRICE_API_URL ?? "https://api.noghresea.ir/api/market/getSilverPrice";

export function getSilverQuote(): Promise<MarketQuote> {
  return fetchProviderQuote("SILVER", SILVER_URL, "noghresea.ir");
}
