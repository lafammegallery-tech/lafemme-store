import { requireAdmin } from "@/backend/auth/session";
import { getPrisma } from "@/backend/database/prisma";
import { PageLayout, PageHero } from "@/components/common";
import { Container, Card, PriceDisplay } from "@/components/ui";

export const dynamic = "force-dynamic";

export default async function Page() {
  await requireAdmin();
  const rows = await getPrisma().marketPrice.findMany({ orderBy: { recordedAt: "desc" }, take: 100 });

  return (
    <PageLayout>
      <PageHero title="تاریخچه بازار" description="آخرین رکوردهای قیمت طلا و نقره" />
      <section className="py-12">
        <Container>
          <div className="grid gap-3">
            {rows.map((r) => (
              <Card key={r.id} className="p-4">
                <div className="flex justify-between">
                  <span>
                    {r.metalType} • {r.source} • {r.isStale ? "قدیمی" : "معتبر"}
                  </span>
                  <PriceDisplay value={Number(r.price)} />
                </div>
                <small>{r.recordedAt.toLocaleString("fa-IR")}</small>
              </Card>
            ))}
          </div>
        </Container>
      </section>
    </PageLayout>
  );
}
