import type { Metadata } from "next";
import { AccountLayout } from "@/components/account/AccountLayout";
import { PageLayout } from "@/components/common";
import { Button, Card, Checkbox, Field, Input, Textarea, Badge } from "@/components/ui";
import { requireSession } from "@/backend/auth/session";
import { getPrisma } from "@/backend/database/prisma";
import { createAddressAction, deleteAddressAction } from "@/app/actions/address";

export const metadata: Metadata = { title: "آدرس‌ها", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

export default async function Page() {
  const session = await requireSession("/addresses");
  const rows = await getPrisma().address.findMany({
    where: { userId: session.userId, deletedAt: null },
    orderBy: [{ isDefault: "desc" }, { createdAt: "desc" }],
  });

  return (
    <PageLayout>
      <AccountLayout>
        <Card className="dashboard-card account-form-card">
          <header className="panel-form-header">
            <h1>آدرس‌های من</h1>
            <p>نشانی و مشخصات گیرنده را برای ارسال سفارش وارد کنید.</p>
          </header>
          <form action={createAddressAction} className="address-form">
            <Field label="عنوان آدرس"><Input name="title" placeholder="مثلاً خانه یا محل کار" required /></Field>
            <Field label="نام گیرنده"><Input name="recipient" autoComplete="name" placeholder="نام و نام خانوادگی" required /></Field>
            <Field label="شماره موبایل"><Input name="phone" type="tel" inputMode="numeric" dir="ltr" autoComplete="tel" placeholder="09xxxxxxxxx" required /></Field>
            <Field label="استان"><Input name="province" autoComplete="address-level1" placeholder="مثلاً تهران" required /></Field>
            <Field label="شهر"><Input name="city" autoComplete="address-level2" placeholder="مثلاً تهران" required /></Field>
            <Field label="کد پستی (اختیاری)"><Input name="postalCode" inputMode="numeric" dir="ltr" autoComplete="postal-code" placeholder="کد پستی ۱۰ رقمی" /></Field>
            <Field label="نشانی کامل" className="form-span-full"><Textarea name="addressLine" autoComplete="street-address" rows={3} placeholder="خیابان، کوچه و نام ساختمان" required /></Field>
            <Field label="پلاک (اختیاری)"><Input name="plaque" inputMode="numeric" placeholder="شماره پلاک" /></Field>
            <Field label="واحد (اختیاری)"><Input name="unit" inputMode="numeric" placeholder="شماره واحد" /></Field>
            <div className="form-actions form-span-full">
              <Checkbox name="isDefault" label="انتخاب به‌عنوان آدرس پیش‌فرض" />
              <Button type="submit">افزودن آدرس</Button>
            </div>
          </form>
          <section className="saved-addresses" aria-label="آدرس‌های ذخیره‌شده">
            {rows.length > 0 && <h2>آدرس‌های ذخیره‌شده</h2>}
            {rows.map(address => (
              <Card key={address.id} className="saved-address-card">
                <div className="saved-address-heading"><h3>{address.title}</h3>{address.isDefault && <Badge tone="gold">پیش‌فرض</Badge>}</div>
                <p>{address.recipient} <span aria-hidden="true">·</span> <bdi>{address.phone}</bdi></p>
                <p>{address.province}، {address.city}، {address.addressLine}</p>
                <form action={deleteAddressAction}><input type="hidden" name="id" value={address.id} /><Button type="submit" variant="ghost" size="sm">حذف آدرس</Button></form>
              </Card>
            ))}
          </section>
        </Card>
      </AccountLayout>
    </PageLayout>
  );
}
