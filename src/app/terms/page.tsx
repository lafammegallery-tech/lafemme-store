import type { Metadata } from "next";
import { InfoPage } from "@/components/content/InfoPage";
import { PageHero, PageLayout } from "@/components/common";
export const metadata: Metadata = {
  title: "قوانین استفاده | La Femme",
  description: "شرایط و قوانین استفاده از فروشگاه La Femme",
  alternates: { canonical: "/terms" },
};
/** متن نمونه قوانین که پیش از انتشار باید توسط مشاور حقوقی تأیید شود. */
export default function TermsPage() {
  return (
    <PageLayout>
      <PageHero title="قوانین و شرایط استفاده" />
      <InfoPage>
        <p>استفاده از این وب‌سایت به معنی پذیرش شرایط درج‌شده در این صفحه است.</p>
        <h2>قیمت و موجودی</h2>
        <p>
          در نسخه فعلی همه قیمت‌ها و موجودی‌ها آزمایشی‌اند. قیمت معتبر فقط پس از اتصال موتور
          قیمت‌گذاری و تأیید سفارش مشخص می‌شود.
        </p>
        <h2>ثبت سفارش</h2>
        <p>
          نمایش فرم‌ها به معنی ثبت سفارش واقعی نیست و هیچ پرداختی در فرانت‌اند فعلی انجام نمی‌شود.
        </p>
        <h2>مالکیت محتوا</h2>
        <p>نام، نشان، طراحی و محتوای La Femme متعلق به مجموعه است.</p>
      </InfoPage>
    </PageLayout>
  );
}
