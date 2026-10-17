import { requireAdmin } from "@/backend/auth/session";
import { getPrisma } from "@/backend/database/prisma";
import { createPaymentMethodAction, togglePaymentMethodAction, deletePaymentMethodAction } from "@/app/actions/admin";
import { PageLayout, PageHero } from "@/components/common";
import { Container, Card, Input, Textarea, Button, Badge, Field, Checkbox } from "@/components/ui";
import { PaymentPolicyForm, PaymentRangeForm } from "@/components/admin/PaymentPolicyForms";
import { getPaymentPolicy } from "@/backend/services/payment-policy.service";

export const dynamic = "force-dynamic";

const TYPE_LABELS: Record<string, string> = {
  CARD_TO_CARD: "کارت به کارت",
  ONLINE: "درگاه آنلاین",
  CASH_ON_DELIVERY: "پرداخت در محل",
  WALLET: "کیف پول",
};

export default async function Page() {
  await requireAdmin();
  const [rows, policy] = await Promise.all([getPrisma().paymentMethodConfig.findMany({ orderBy: { sortOrder: "asc" } }), getPaymentPolicy()]);

  return (
    <PageLayout>
      <PageHero title="روش‌های پرداخت" description="روش‌های پرداخت فروشگاه را اضافه و مدیریت کنید" />
      <Container>
        <Card className="p-6 mb-6"><PaymentPolicyForm policy={policy} /></Card>
        <p className="mb-6">هر روش فقط در بازهٔ مبلغ خودش به مشتری نمایش داده می‌شود. بازهٔ پیش‌فرض ۰ تا نامحدود است. می‌توانید چند کارت با بازه‌های متفاوت داشته باشید؛ اگر هیچ روش فعالی با مبلغ سفارش سازگار نباشد، ثبت سفارش بسته می‌شود.</p>
        <div className="admin-grid">
          <Card className="admin-form-card">
            <h2 className="admin-form-title">افزودن روش پرداخت</h2>
            <form action={createPaymentMethodAction} className="grid gap-3">
              <Field label="نام روش پرداخت"><Input name="name" placeholder="مثلاً کارت به کارت ملت" required /></Field>
              <Field label="نوع پرداخت">
              <select name="type" className="admin-select form-control" defaultValue="CARD_TO_CARD">
                <option value="CARD_TO_CARD">کارت به کارت</option>
                <option value="CASH_ON_DELIVERY">پرداخت در محل</option>
                <option value="ONLINE">درگاه آنلاین</option>
                <option value="WALLET">کیف پول</option>
              </select>
              </Field>
              <Field label="شماره کارت"><Input name="cardNumber" placeholder="شماره کارت ۱۶ رقمی" inputMode="numeric" dir="ltr" /></Field>
              <Field label="نام صاحب کارت"><Input name="cardHolder" placeholder="نام و نام خانوادگی" /></Field>
              <Field label="نام بانک"><Input name="bankName" placeholder="مثلاً ملت" /></Field>
              <Field label="توضیحات برای مشتری"><Textarea name="description" rows={2} /></Field>
              <Field label="ترتیب نمایش"><Input name="sortOrder" type="number" placeholder="۰" dir="ltr" /></Field>
              <Field label="حداقل مبلغ سفارش (تومان)"><Input name="minimumAmount" defaultValue="0" inputMode="numeric" dir="ltr" required /></Field>
              <Field label="سقف مبلغ سفارش (تومان)" hint="خالی یعنی نامحدود؛ سقف شامل این عدد نیست."><Input name="maximumAmount" inputMode="numeric" dir="ltr" /></Field>
              <Checkbox name="requiresReceipt" defaultChecked label="نیازمند بارگذاری رسید توسط مشتری" />
              <Button type="submit">افزودن روش پرداخت</Button>
            </form>
          </Card>

          <div className="admin-list">
            {rows.length === 0 && <Card className="p-6 text-center admin-empty">هنوز روش پرداختی اضافه نشده است.</Card>}
            {rows.map((m) => (
              <Card key={m.id} className="p-5">
                <div className="admin-item">
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
                </div>
                <PaymentRangeForm id={m.id} range={{ minimumAmount: Number(m.minimumAmount), maximumAmount: m.maximumAmount === null ? null : Number(m.maximumAmount) }} />
              </Card>
            ))}
          </div>
        </div>
      </Container>
    </PageLayout>
  );
}
