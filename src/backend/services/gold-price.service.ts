import "server-only";
import { getCustomQuote } from "./custom-price.service";

export function getGoldQuote() {
  return getCustomQuote("GOLD");
}
