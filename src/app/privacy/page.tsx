import type { Metadata } from "next";
import { InfoPage } from "@/components/content/InfoPage";
import { PageHero, PageLayout } from "@/components/common";
export const metadata: Metadata = {
  title: "حریم خصوصی | La Femme",
  description: "سیاست حریم خصوصی La Femme",
  alternates: { canonical: "/privacy" },
};
/** متن نمونه حریم خصوصی تا زمان تأیید حقوقی نهایی. */
export default function PrivacyPage() {
  return (
    <PageLayout>
      <PageHero title="سیاست حریم خصوصی" />
      <InfoPage>
        <p>
          این صفحه نحوه جمع‌آوری، استفاده و نگهداری اطلاعات کاربران را توضیح می‌دهد. در نسخه فعلی
          هیچ اطلاعاتی به Backend ارسال نمی‌شود.
        </p>
        <h2>اطلاعات حساب</h2>
        <p>
          پس از راه‌اندازی Backend، اطلاعات فقط برای ارائه خدمات، پردازش سفارش و پشتیبانی استفاده
          خواهد شد.
        </p>
        <h2>کوکی‌ها</h2>
        <p>کوکی‌های ضروری برای عملکرد سایت و تنظیمات کاربر استفاده خواهند شد.</p>
        <h2>حقوق کاربران</h2>
        <p>کاربران می‌توانند درخواست مشاهده، اصلاح یا حذف اطلاعات خود را ثبت کنند.</p>
      </InfoPage>
    </PageLayout>
  );
}
