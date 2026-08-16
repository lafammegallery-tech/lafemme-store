import { requireAdmin } from "@/backend/auth/session";
import { getPrisma } from "@/backend/database/prisma";
import { createPaymentMethodAction, togglePaymentMethodAction, deletePaymentMethodAction } from "@/app/actions/admin";
import { PageLayout, PageHero } from "@/components/common";
import { Container, Card, Input, Textarea, Button, Badge } from "@/components/ui";

export const dynamic = "force-dynamic";

const TYPE_LABELS: Record<string, string> = {
  CARD_TO_CARD: "کارت به کارت",
  ONLINE: "درگاه آنلاین",
  CASH_ON_DELIVERY: "پرداخت در محل",
  WALLET: "کیف پول",
};

export default async function Page() {
  await requireAdmin();
  const rows = await getPrisma().paymentMethodConfig.findMany({ orderBy: { sortOrder: "asc" } });

  return (
    <PageLayout>
      <PageHero title="روش‌های پرداخت" description="روش‌های پرداخت فروشگاه را اضافه و مدیریت کنید" />
      <Container>
        <div className="admin-grid">
          <Card className="admin-form-card">
            <h2 className="admin-form-title">افزودن روش پرداخت</h2>
            <form action={createPaymentMethodAction} className="grid gap-3">
              <Input name="name" placeholder="نام (مثلاً کارت به کارت ملت)" required />
              <select name="type" className="admin-select" defaultValue="CARD_TO_CARD">
                <option value="CARD_TO_CARD">کارت به کارت</option>
                <option value="CASH_ON_DELIVERY">پرداخت در محل</option>
                <option value="ONLINE">درگاه آنلاین</option>
                <option value="WALLET">کیف پول</option>
              </select>
              <Input name="cardNumber" placeholder="شماره کارت (۱۶ رقم)" dir="ltr" />
              <Input name="cardHolder" placeholder="نام صاحب کارت" />
              <Input name="bankName" placeholder="نام بانک" />
              <Textarea name="description" placeholder="توضیحات برای مشتری" rows={2} />
              <Input name="sortOrder" type="number" placeholder="ترتیب نمایش (۰)" dir="ltr" />
              <label className="admin-checkbox">
                <input type="checkbox" name="requiresReceipt" defaultChecked />
                <span>نیازمند بارگذاری رسید توسط مشتری</span>
              </label>
              <Button type="submit">افزودن روش پرداخت</Button>
            </form>
          </Card>

          <div className="admin-list">
            {rows.length === 0 && <Card className="p-6 text-center admin-empty">هنوز روش پرداختی اضافه نشده است.</Card>}
            {rows.map((m) => (
              <Card key={m.id} className="admin-item">
                <div className="admin-item-main">
                  <div className="admin-item-head">
                    <b>{m.name}</b>
                    <Badge tone={m.isActive ? "success" : "neutral"}>{m.isActive ? "فعال" : "غیرفعال"}</Badge>
                    <Badge tone="gold">{TYPE_LABELS[m.type] ?? m.type}</Badge>
                    {m.requiresReceipt && <Badge tone="neutral">رسید لازم</Badge>}
                  </div>
                  {m.cardNumber && <p className="admin-item-sub" dir="ltr">{m.cardNumber}{m.cardHolder ? ` — ${m.cardHolder}` : ""}</p>}
                  {m.description && <p className="admin-item-sub">{m.description}</p>}
                </div>
                <div className="admin-item-actions">
                  <form action={togglePaymentMethodAction}>
                    <input type="hidden" name="id" value={m.id} />
                    <Button type="submit" variant="secondary" size="sm">{m.isActive ? "غیرفعال" : "فعال"}</Button>
                  </form>
                  <form action={deletePaymentMethodAction}>
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
