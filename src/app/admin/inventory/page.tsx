import { requireAdmin } from "@/backend/auth/session";
import { getPrisma } from "@/backend/database/prisma";
import { updateInventoryAction } from "@/app/actions/admin";
import { PageLayout, PageHero } from "@/components/common";
import { Container, Card, Button, Field, Input } from "@/components/ui";

export const dynamic = "force-dynamic";

export default async function Page() {
  await requireAdmin();
  const rows = await getPrisma().product.findMany({
    where: { deletedAt: null }, include: { inventory: true }, orderBy: { name: "asc" },
  });

  return (
    <PageLayout>
      <PageHero title="مدیریت موجودی" description="کنترل موجودی قابل فروش و هشدار کمبود" />
      <section className="inventory-section">
        <Container>
          <div className="inventory-list">
            {rows.map(product => (
              <Card key={product.id} className="inventory-card">
                <form action={updateInventoryAction} className="inventory-form">
                  <input type="hidden" name="productId" value={product.id} />
                  <div className="inventory-product">
                    <h2>{product.name}</h2>
                    <p>رزروشده: <bdi>{(product.inventory?.reserved ?? 0).toLocaleString("fa-IR")}</bdi> عدد</p>
                  </div>
                  <Field label="موجودی کل" hint="تعداد کالا در انبار">
                    <Input name="quantity" type="number" inputMode="numeric" dir="ltr" min="0" step="1" required defaultValue={product.inventory?.quantity ?? product.stock} />
                  </Field>
                  <Field label="حد هشدار" hint="هشدار کاهش موجودی">
                    <Input name="lowStockAt" type="number" inputMode="numeric" dir="ltr" min="0" step="1" required defaultValue={product.inventory?.lowStockAt ?? 3} />
                  </Field>
                  <Button type="submit" aria-label={`ذخیره موجودی ${product.name}`}>ذخیره تغییرات</Button>
                </form>
              </Card>
            ))}
          </div>
        </Container>
      </section>
    </PageLayout>
  );
}
