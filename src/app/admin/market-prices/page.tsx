import { requireAdmin } from "@/backend/auth/session";
import { getPrisma } from "@/backend/database/prisma";
import { getMarketQuotes } from "@/backend/services/market-price.service";
import { PageLayout, PageHero } from "@/components/common";
import { Container, Card, PriceDisplay } from "@/components/ui";
import { MarketSyncButton } from "./MarketSyncButton";

export const dynamic = "force-dynamic";

/** صفحه مدیریت قیمت طلا و نقره برای ادمین. */
export default async function Page() {
  await requireAdmin();

  // دریافت قیمت‌های لحظه‌ای و تاریخچه از دیتابیس به صورت موازی
  const [liveQuotes, historyRows] = await Promise.all([
    getMarketQuotes(),
    getPrisma().marketPrice.findMany({
      orderBy: { recordedAt: "desc" },
      take: 50,
    }),
  ]);

  return (
    <PageLayout>
      <PageHero title="قیمت بازار" description="مدیریت قیمت لحظه‌ای طلا و نقره" />
      <section className="py-12">
        <Container>

          {/* قیمت‌های لحظه‌ای */}
          <div className="grid gap-4 mb-8" style={{ gridTemplateColumns: "repeat(2, 1fr)" }}>
            <Card className="p-6">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <span style={{ color: "var(--color-gold)", fontSize: "0.8rem", fontWeight: 700, letterSpacing: 2 }}>
                    طلا
                  </span>
                  <h2 style={{ fontSize: "1.8rem", margin: "6px 0" }}>
                    <PriceDisplay value={liveQuotes.gold.price} />
                  </h2>
                </div>
                <span
                  className={liveQuotes.gold.stale ? "" : "market-change market-change--up"}
                  style={liveQuotes.gold.stale ? { color: "#888", fontSize: "0.82rem" } : {}}
                >
                  {liveQuotes.gold.stale ? "قدیمی" : `${liveQuotes.gold.change24h > 0 ? "+" : ""}${liveQuotes.gold.change24h.toFixed(2)}٪`}
                </span>
              </div>
              <small style={{ color: "var(--color-gray)" }}>
                منبع: {liveQuotes.gold.source} | آخرین به‌روزرسانی: {new Date(liveQuotes.gold.updatedAt).toLocaleString("fa-IR")}
              </small>
            </Card>

            <Card className="p-6">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <span style={{ color: "#b8bcc4", fontSize: "0.8rem", fontWeight: 700, letterSpacing: 2 }}>
                    نقره
                  </span>
                  <h2 style={{ fontSize: "1.8rem", margin: "6px 0" }}>
                    <PriceDisplay value={liveQuotes.silver.price} />
                  </h2>
                </div>
                <span
                  className={liveQuotes.silver.stale ? "" : "market-change market-change--up"}
                  style={liveQuotes.silver.stale ? { color: "#888", fontSize: "0.82rem" } : {}}
                >
                  {liveQuotes.silver.stale ? "قدیمی" : `${liveQuotes.silver.change24h > 0 ? "+" : ""}${liveQuotes.silver.change24h.toFixed(2)}٪`}
                </span>
              </div>
              <small style={{ color: "var(--color-gray)" }}>
                منبع: {liveQuotes.silver.source} | آخرین به‌روزرسانی: {new Date(liveQuotes.silver.updatedAt).toLocaleString("fa-IR")}
              </small>
            </Card>
          </div>

          {/* دکمه ذخیره در دیتابیس */}
          <div className="mb-8">
            <MarketSyncButton />
          </div>

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
