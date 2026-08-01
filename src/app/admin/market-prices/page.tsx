import { requireAdmin } from "@/backend/auth/session";
import { getPrisma } from "@/backend/database/prisma";
import { getMarketQuotes } from "@/backend/services/market-price.service";
import { PageLayout, PageHero } from "@/components/common";
import { Container, Card, PriceDisplay } from "@/components/ui";
import { MarketSyncButton } from "./MarketSyncButton";
import { updateMarketOverrideAction } from "@/app/actions/admin";

export const dynamic = "force-dynamic";

/** صفحه مدیریت قیمت طلا و نقره برای ادمین. */
export default async function Page() {
  await requireAdmin();

  // دریافت قیمت‌های لحظه‌ای، تاریخچه و تنظیمات دستی به صورت موازی
  const prismaExt = getPrisma() as unknown as {
    marketSettings?: { findUnique: (args: unknown) => Promise<unknown> };
  };

  const [liveQuotes, historyRows, currentSettings] = await Promise.all([
    getMarketQuotes(),
    getPrisma().marketPrice.findMany({
      orderBy: { recordedAt: "desc" },
      take: 50,
    }),
    prismaExt.marketSettings?.findUnique?.({ where: { id: "global" } }).catch(() => null) ?? null,
  ]);

  const settings = currentSettings as {
    isManualMode: boolean;
    manualGold750: unknown;
    manualSilver999: unknown;
  } | null;

  return (
    <PageLayout>
      <PageHero title="قیمت بازار" description="مدیریت قیمت لحظه‌ای طلا و نقره" />
      <section className="py-12">
        <Container>

          {/* قیمت‌های لحظه‌ای */}
          <div className="grid gap-4 mb-8" style={{ gridTemplateColumns: "repeat(3, 1fr)" }}>
            <Card className="p-6">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <span style={{ color: "var(--color-gold)", fontSize: "0.8rem", fontWeight: 700, letterSpacing: 2 }}>
                    طلا عیار ۹۹۵
                    {liveQuotes.gold995.isFallback && <span style={{ color: "var(--color-warning)", marginRight: 6 }}>(پشتیبان)</span>}
                    {liveQuotes.gold995.isManual && <span style={{ color: "var(--color-warning)", marginRight: 6 }}>(دستی)</span>}
                  </span>
                  <h2 style={{ fontSize: "1.6rem", margin: "6px 0" }}>
                    <PriceDisplay value={liveQuotes.gold995.price} />
                  </h2>
                </div>
                <span
                  className={liveQuotes.gold995.stale ? "" : liveQuotes.gold995.change24h >= 0 ? "market-up" : "market-down"}
                  style={liveQuotes.gold995.stale ? { color: "#888", fontSize: "0.82rem" } : {}}
                >
                  {liveQuotes.gold995.stale ? "قدیمی" : `${liveQuotes.gold995.change24h > 0 ? "+" : ""}${liveQuotes.gold995.change24h.toFixed(2)}٪`}
                </span>
              </div>
              <small style={{ color: "var(--color-gray)" }}>
                منبع: {liveQuotes.gold995.source}
              </small>
            </Card>

            <Card className="p-6">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <span style={{ color: "var(--color-gold)", fontSize: "0.8rem", fontWeight: 700, letterSpacing: 2 }}>
                    طلا عیار ۷۵۰
                    {liveQuotes.gold750.isFallback && <span style={{ color: "var(--color-warning)", marginRight: 6 }}>(پشتیبان)</span>}
                    {liveQuotes.gold750.isManual && <span style={{ color: "var(--color-warning)", marginRight: 6 }}>(دستی)</span>}
                  </span>
                  <h2 style={{ fontSize: "1.6rem", margin: "6px 0" }}>
                    <PriceDisplay value={liveQuotes.gold750.price} />
                  </h2>
                </div>
                <span
                  className={liveQuotes.gold750.stale ? "" : liveQuotes.gold750.change24h >= 0 ? "market-up" : "market-down"}
                  style={liveQuotes.gold750.stale ? { color: "#888", fontSize: "0.82rem" } : {}}
                >
                  {liveQuotes.gold750.stale ? "قدیمی" : `${liveQuotes.gold750.change24h > 0 ? "+" : ""}${liveQuotes.gold750.change24h.toFixed(2)}٪`}
                </span>
              </div>
              <small style={{ color: "var(--color-gray)" }}>
                منبع: {liveQuotes.gold750.source} | {new Date(liveQuotes.gold750.updatedAt).toLocaleString("fa-IR")}
              </small>
            </Card>

            <Card className="p-6">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <span style={{ color: "#b8bcc4", fontSize: "0.8rem", fontWeight: 700, letterSpacing: 2 }}>
                    نقره ۹۹۹
                    {liveQuotes.silver999.isFallback && <span style={{ color: "var(--color-warning)", marginRight: 6 }}>(پشتیبان)</span>}
                    {liveQuotes.silver999.isManual && <span style={{ color: "var(--color-warning)", marginRight: 6 }}>(دستی)</span>}
                  </span>
                  <h2 style={{ fontSize: "1.6rem", margin: "6px 0" }}>
                    <PriceDisplay value={liveQuotes.silver999.price} />
                  </h2>
                </div>
                <span
                  className={liveQuotes.silver999.stale ? "" : liveQuotes.silver999.change24h >= 0 ? "market-up" : "market-down"}
                  style={liveQuotes.silver999.stale ? { color: "#888", fontSize: "0.82rem" } : {}}
                >
                  {liveQuotes.silver999.stale ? "قدیمی" : `${liveQuotes.silver999.change24h > 0 ? "+" : ""}${liveQuotes.silver999.change24h.toFixed(2)}٪`}
                </span>
              </div>
              <small style={{ color: "var(--color-gray)" }}>
                منبع: {liveQuotes.silver999.source} | {new Date(liveQuotes.silver999.updatedAt).toLocaleString("fa-IR")}
              </small>
            </Card>
          </div>

          {/* دکمه ذخیره در دیتابیس */}
          <div className="mb-8">
            <MarketSyncButton />
          </div>

          {/* فرم تنظیم دستی */}
          <Card className="p-6 mb-8">
            <h2 style={{ marginBottom: "1rem", color: "var(--color-gold)" }}>تنظیم قیمت دستی</h2>
            <p style={{ color: "var(--color-gray)", marginBottom: "1.5rem", fontSize: "0.9rem" }}>
              در صورت فعال‌سازی حالت دستی، قیمت‌های وارد شده جایگزین قیمت‌های API می‌شوند.
            </p>
            <form action={updateMarketOverrideAction} className="grid gap-4">
              <label className="flex items-center gap-3">
                <input
                  type="checkbox"
                  name="isManualMode"
                  defaultChecked={settings?.isManualMode ?? false}
                  className="w-5 h-5"
                />
                <span>فعال‌سازی حالت دستی</span>
              </label>
              <div className="grid gap-4" style={{ gridTemplateColumns: "1fr 1fr" }}>
                <div>
                  <label style={{ display: "block", marginBottom: "0.5rem", color: "var(--color-gray)", fontSize: "0.85rem" }}>
                    قیمت طلا ۷۵۰ (تومان)
                  </label>
                  <input
                    type="number"
                    name="manualGold750"
                    defaultValue={settings?.manualGold750 ? String(settings.manualGold750) : ""}
                    placeholder="مثال: 18590"
                    min="0"
                    dir="ltr"
                    style={{
                      width: "100%",
                      padding: "10px 14px",
                      background: "var(--color-surface-raised)",
                      border: "1px solid var(--color-border)",
                      borderRadius: "10px",
                      color: "var(--color-white)",
                      fontSize: "1rem",
                    }}
                  />
                </div>
                <div>
                  <label style={{ display: "block", marginBottom: "0.5rem", color: "var(--color-gray)", fontSize: "0.85rem" }}>
                    قیمت نقره ۹۹۹ (تومان)
                  </label>
                  <input
                    type="number"
                    name="manualSilver999"
                    defaultValue={settings?.manualSilver999 ? String(settings.manualSilver999) : ""}
                    placeholder="مثال: 1200"
                    min="0"
                    dir="ltr"
                    style={{
                      width: "100%",
                      padding: "10px 14px",
                      background: "var(--color-surface-raised)",
                      border: "1px solid var(--color-border)",
                      borderRadius: "10px",
                      color: "var(--color-white)",
                      fontSize: "1rem",
                    }}
                  />
                </div>
              </div>
              <div>
                <button
                  type="submit"
                  className="btn btn-primary"
                  style={{ minWidth: "180px" }}
                >
                  ذخیره تنظیمات
                </button>
              </div>
            </form>
          </Card>

          {/* تاریخچه قیمت‌ها */}
          <h2 style={{ marginBottom: "1rem" }}>تاریخچه ثبت قیمت‌ها</h2>
          <div className="grid gap-3">
            {historyRows.length === 0 ? (
              <Card className="p-6 text-center">
                <p style={{ color: "var(--color-gray)" }}>هنوز قیمتی ذخیره نشده است. از دکمه بالا برای ثبت استفاده کنید.</p>
              </Card>
            ) : (
              historyRows.map((r) => (
                <Card key={r.id} className="p-4">
                  <div className="flex justify-between items-center">
                    <span>
                      <strong style={{ color: r.metalType === "GOLD" ? "var(--color-gold)" : "#b8bcc4" }}>
                        {r.metalType === "GOLD" ? "طلا" : "نقره"}
                      </strong>
                      {" • "}
                      {r.source}
                      {r.isStale && (
                        <span style={{ color: "#888", marginRight: "8px", fontSize: "0.8rem" }}>(قدیمی)</span>
                      )}
                    </span>
                    <PriceDisplay value={Number(r.price)} />
                  </div>
                  <small style={{ color: "var(--color-gray)" }}>
                    {r.recordedAt.toLocaleString("fa-IR")}
                  </small>
                </Card>
              ))
            )}
          </div>
        </Container>
      </section>
    </PageLayout>
  );
}
