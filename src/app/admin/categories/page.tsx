import { requireAdmin } from "@/backend/auth/session";
import { getPrisma } from "@/backend/database/prisma";
import { createCategoryAction, toggleCategoryAction } from "@/app/actions/admin";
import { PageLayout, PageHero } from "@/components/common";
import { Container, Card, Input, Textarea, Button, Badge, Field } from "@/components/ui";
import ImageUploader from "@/components/admin/ImageUploader";

export const dynamic = "force-dynamic";

export default async function Page() {
  await requireAdmin();
  const rows = await getPrisma().category.findMany({
    where: { deletedAt: null },
    include: { _count: { select: { products: true } } },
    orderBy: { sortOrder: "asc" },
  });

  return (
    <PageLayout>
      <PageHero title="دسته‌بندی‌ها" description="ساخت و مدیریت دسته‌بندی محصولات" />
      <Container>
        <div className="admin-grid">
          <Card className="admin-form-card">
            <h2 className="admin-form-title">افزودن دسته‌بندی</h2>
            <form action={createCategoryAction} className="grid gap-3">
              <Field label="نام دسته"><Input name="name" placeholder="مثلاً شمش طلا" required /></Field>
              <Field label="نامک انگلیسی"><Input name="slug" placeholder="gold-bars" dir="ltr" required /></Field>
              <Field label="توضیحات"><Textarea name="description" placeholder="توضیح کوتاه درباره دسته‌بندی" rows={2} /></Field>
              <Field label="ترتیب نمایش"><Input name="sortOrder" type="number" placeholder="۰" dir="ltr" /></Field>
              <ImageUploader name="imageUrl" />
              <Button type="submit">ساخت دسته‌بندی</Button>
            </form>
          </Card>

          <div className="admin-list">
            {rows.length === 0 && <Card className="p-6 text-center admin-empty">هنوز دسته‌بندی اضافه نشده است.</Card>}
            {rows.map((x) => (
              <Card key={x.id} className="admin-item">
                <div className="admin-item-main">
                  <div className="admin-item-head">
                    <b>{x.name}</b>
                    <Badge tone={x.isActive ? "success" : "neutral"}>{x.isActive ? "فعال" : "غیرفعال"}</Badge>
                  </div>
                  <p className="admin-item-sub" dir="ltr">{x.slug} • {x._count.products} محصول</p>
                  {x.description && <p className="admin-item-sub">{x.description}</p>}
                </div>
                <div className="admin-item-actions">
                  <form action={toggleCategoryAction}>
                    <input type="hidden" name="id" value={x.id} />
                    <Button type="submit" variant="secondary" size="sm">{x.isActive ? "غیرفعال" : "فعال"}</Button>
                  </form>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </Container>
    </PageLayout>
  );
}
