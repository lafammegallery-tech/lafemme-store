import { requireAdmin } from "@/backend/auth/session";
import { getPrisma } from "@/backend/database/prisma";
import { createShippingMethodAction, toggleShippingMethodAction, deleteShippingMethodAction } from "@/app/actions/admin";
import { PageLayout, PageHero } from "@/components/common";
import { Container, Card, Input, Textarea, Button, Badge } from "@/components/ui";

export const dynamic = "force-dynamic";

const fmt = (n: number) => new Intl.NumberFormat("fa-IR").format(n);

export default async function Page() {
  await requireAdmin();
  const rows = await getPrisma().shippingMethodConfig.findMany({ orderBy: { sortOrder: "asc" } });

  return (
    <PageLayout>
      <PageHero title="روش‌های ارسال" description="روش‌های ارسال و هزینه آن‌ها را مدیریت کنید" />
      <Container>
        <div className="admin-grid">
          <Card className="admin-form-card">
            <h2 className="admin-form-title">افزودن روش ارسال</h2>
            <form action={createShippingMethodAction} className="grid gap-3">
              <Input name="name" placeholder="نام (مثلاً پیک امین)" required />
              <Input name="cost" type="number" placeholder="هزینه (تومان) — ۰ برای رایگان" dir="ltr" />
              <Textarea name="description" placeholder="توضیحات (مثلاً تحویل حضوری در فروشگاه)" rows={2} />
              <Input name="sortOrder" type="number" placeholder="ترتیب نمایش (۰)" dir="ltr" />
              <Button type="submit">افزودن روش ارسال</Button>
            </form>
          </Card>

          <div className="admin-list">
            {rows.length === 0 && <Card className="p-6 text-center admin-empty">هنوز روش ارسالی اضافه نشده است.</Card>}
            {rows.map((m) => (
              <Card key={m.id} className="admin-item">
                <div className="admin-item-main">
                  <div className="admin-item-head">
                    <b>{m.name}</b>
                    <Badge tone={m.isActive ? "success" : "neutral"}>{m.isActive ? "فعال" : "غیرفعال"}</Badge>
                    <Badge tone="gold">{Number(m.cost) === 0 ? "رایگان" : `${fmt(Number(m.cost))} تومان`}</Badge>
                  </div>
                  {m.description && <p className="admin-item-sub">{m.description}</p>}
                </div>
                <div className="admin-item-actions">
                  <form action={toggleShippingMethodAction}>
                    <input type="hidden" name="id" value={m.id} />
                    <Button type="submit" variant="secondary" size="sm">{m.isActive ? "غیرفعال" : "فعال"}</Button>
                  </form>
                  <form action={deleteShippingMethodAction}>
                    <input type="hidden" name="id" value={m.id} />
                    <Button type="submit" variant="danger" size="sm">حذف</Button>
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
