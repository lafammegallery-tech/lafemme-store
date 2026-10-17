import { requireAdmin } from "@/backend/auth/session";
import { MoneyInput } from "@/components/ui/MoneyInput";
import { getPrisma } from "@/backend/database/prisma";
import { createCouponAction, toggleCouponAction } from "@/app/actions/admin";
import { PageLayout, PageHero } from "@/components/common";
import { Container, Card, Input, Button, Field } from "@/components/ui";

export const dynamic = "force-dynamic";

export default async function Page() {
  await requireAdmin();
  const rows = await getPrisma().coupon.findMany({
    include: { _count: { select: { usages: true } } },
    orderBy: { createdAt: "desc" },
  });

  return (
    <PageLayout>
      <PageHero title="کدهای تخفیف" description="مدیریت تخفیف و ارسال رایگان" />
      <Container>
        <form action={createCouponAction} className="grid gap-3 max-w-xl py-8">
          <Field label="کد تخفیف"><Input name="code" placeholder="WELCOME10" dir="ltr" required /></Field>
          <Field label="عنوان"><Input name="title" placeholder="مثلاً تخفیف خوش‌آمدگویی" required /></Field>
          <Field label="نوع تخفیف">
          <select name="type" className="form-control" defaultValue="PERCENT">
            <option value="PERCENT">درصدی</option>
            <option value="FIXED">مبلغ ثابت</option>
            <option value="FREE_SHIPPING">ارسال رایگان</option>
          </select>
          </Field>
          <Field label="مقدار تخفیف (درصد یا تومان)"><MoneyInput name="value" allowDecimals placeholder="۰" /></Field>
          <Field label="حداقل خرید (تومان)"><MoneyInput name="minimumAmount" placeholder="۰" /></Field>
          <Field label="سقف تعداد استفاده"><Input name="usageLimit" type="number" placeholder="تعداد مجاز" /></Field>
          <Field label="تاریخ انقضا"><Input name="expiresAt" type="date" /></Field>
          <Button type="submit">ساخت کد</Button>
        </form>
        <div className="grid gap-3 pb-12">
          {rows.map((x) => (
            <Card key={x.id} className="p-4 flex justify-between">
              <div>
                <b dir="ltr">{x.code}</b>
                <p>
                  {x.title} • {x.type} • {x._count.usages} استفاده
                </p>
              </div>
              <form action={toggleCouponAction}>
                <input type="hidden" name="id" value={x.id} />
                <Button variant="secondary">{x.isActive ? "غیرفعال" : "فعال"}</Button>
              </form>
            </Card>
          ))}
        </div>
      </Container>
    </PageLayout>
  );
}
