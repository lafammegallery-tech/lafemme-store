function parseRows(payload: unknown, now: number) {
  if (!payload || typeof payload !== "object" || !("prices" in payload) || !Array.isArray(payload.prices)) throw new Error("Invalid prices response");
  const prices: unknown[] = payload.prices;
  const read = (asset: string) => {
    const rows = prices.filter((row: unknown) => row && typeof row === "object" && "asset" in row && row.asset === asset);
    if (rows.length !== 1) return null;
    const row = rows[0] as Record<string, unknown>;
    const price = row.buy_price;
    const timestamp = typeof row.updated_at === "string" ? Date.parse(row.updated_at) : NaN;
    if (row.available !== true || typeof price !== "number" || !Number.isSafeInteger(price) || price <= 0 || !Number.isFinite(timestamp) || now - timestamp > 15 * 60_000 || timestamp - now > 60_000) return null;
    return { price, updatedAt: new Date(timestamp).toISOString(), unit: row.unit_code };
  };
  const gold = read("GOLD_18K");
  const silver = read("SILVER_1000G_NADIR");
  return { gold, silver };
}

export function parseCustomPricesPartial(payload: unknown, now = Date.now()) {
  const { gold, silver } = parseRows(payload, now);
  const validGold = gold && gold.unit === "MITHGAL" ? gold : null;
  const validSilver = silver && silver.unit === "PIECE" ? silver : null;
  // Keep 750 unrounded: the existing market service converts it to 995 exactly once.
  return {
    gold: validGold ? { priceToman: validGold.price / 4.3318 / 10, updatedAt: validGold.updatedAt } : null,
    silver: validSilver ? { priceToman: validSilver.price / 1000 / 10, updatedAt: validSilver.updatedAt } : null,
  };
}

export function parseCustomPrices(payload: unknown, now = Date.now()) {
  const parsed = parseCustomPricesPartial(payload, now);
  if (!parsed.gold || !parsed.silver) throw new Error("Missing, invalid or outdated market asset");
  return { gold: parsed.gold, silver: parsed.silver };
}
