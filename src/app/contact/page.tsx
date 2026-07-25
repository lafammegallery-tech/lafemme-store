import type { Metadata } from "next";
import { ContactForm } from "@/components/content/ContactForm";
import { PageHero, PageLayout } from "@/components/common";
import { Card, Container } from "@/components/ui";
export const metadata: Metadata = {
  title: "تماس با ما | La Femme",
  description: "راه‌های ارتباط با مجموعه La Femme",
  alternates: { canonical: "/contact" },
  openGraph: { title: "تماس با La Femme", description: "راه‌های ارتباط با مجموعه La Femme" },
};
/** صفحه تماس با اطلاعات نمونه و فرم آماده اتصال به API. */
export default function ContactPage() {
  return (
    <PageLayout>
      <PageHero
        title="تماس با ما"
        description="برای مشاوره خرید و پشتیبانی با ما در ارتباط باشید."
      />
      <section className="py-16">
        <Container>
          <div className="grid gap-8 lg:grid-cols-2">
            <Card className="contact-form p-8">
              <h2>ارسال پیام</h2>
              <ContactForm />
            </Card>
            <Card className="p-8">
              <h2>اطلاعات تماس</h2>
              <div className="mt-6 space-y-4">
                <p>تلفن: ۰۲۱-۰۰۰۰۰۰۰۰</p>
                <p>ایمیل: info@lafemme.example</p>
                <p>نشانی: تهران، فروشگاه La Femme</p>
                <p>ساعات پاسخ‌گویی: شنبه تا پنجشنبه، ۹ تا ۱۸</p>
              </div>
            </Card>
          </div>
        </Container>
      </section>
    </PageLayout>
  );
}
