import "server-only";
import { getCustomQuote } from "./custom-price.service";

export function getSilverQuote() {
  return getCustomQuote("SILVER");
}
