import "server-only";
import { fetchProviderQuote, type MarketQuote } from "./market-price.service";

const GOLD_URL = process.env.GOLD_PRICE_API_URL ?? "https://api.talasea.ir/api/market/getGoldPrice";

export function getGoldQuote(): Promise<MarketQuote> {
  return fetchProviderQuote("GOLD", GOLD_URL, "talasea.ir");
}
