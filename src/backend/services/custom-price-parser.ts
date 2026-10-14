export function parseCustomPrices(payload: unknown, now = Date.now()) {
  if (!payload || typeof payload !== "object" || !("prices" in payload) || !Array.isArray(payload.prices)) throw new Error("Invalid prices response");
  const prices: unknown[] = payload.prices;
  const read = (asset: string) => {
    const rows = prices.filter((row: unknown) => row && typeof row === "object" && "asset" in row && row.asset === asset);
    if (rows.length !== 1) throw new Error(`Missing or duplicate asset: ${asset}`);
    const row = rows[0] as Record<string, unknown>;
    const price = row.buy_price;
    const timestamp = typeof row.updated_at === "string" ? Date.parse(row.updated_at) : NaN;
    if (row.available !== true || typeof price !== "number" || !Number.isSafeInteger(price) || price <= 0 || !Number.isFinite(timestamp) || now - timestamp > 15 * 60_000 || timestamp - now > 60_000) throw new Error(`Invalid or outdated asset: ${asset}`);
    return { price, updatedAt: new Date(timestamp).toISOString(), unit: row.unit_code };
  };
  const gold = read("GOLD_18K");
  const silver = read("SILVER_1000G_NADIR");
  if (gold.unit !== "MITHGAL" || silver.unit !== "PIECE") throw new Error("Unexpected price units");
  // Keep 750 unrounded: the existing market service converts it to 995 exactly once.
  return {
    gold: { priceToman: gold.price / 4.3318 / 10, updatedAt: gold.updatedAt },
    silver: { priceToman: silver.price / 1000 / 10, updatedAt: silver.updatedAt },
  };
}
