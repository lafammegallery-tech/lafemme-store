import type { Metadata } from "next";
import Link from "next/link";
import { PageHero, PageLayout } from "@/components/common";
import { Accordion, Container } from "@/components/ui";
import { faqItems } from "@/data/faq";
export const metadata: Metadata = {
  title: "سؤالات متداول | La Femme",
  description: "پاسخ پرسش‌های متداول درباره محصولات و خدمات La Femme",
  alternates: { canonical: "/faq" },
};
/** صفحه پرسش‌های متداول با Accordion قابل دسترس. */
export default function FaqPage() {
  return (
    <PageLayout>
      <PageHero title="سؤالات متداول" description="راهنمای انتخاب شمش، پرداخت، ارسال و پیگیری خرید در La Femme" />
      <section className="py-16">
        <Container>
          <p className="mb-8 leading-8 text-lf-gray-light">پاسخ پرسش‌های رایج خرید را اینجا ببینید. برای جزئیات، <Link href="/terms">قوانین خرید</Link> و <Link href="/privacy">حریم خصوصی</Link> را مطالعه کنید؛ اگر پاسخ خود را پیدا نکردید، از <Link href="/contact">تماس با ما</Link> کمک بگیرید.</p>
          <Accordion items={faqItems} />
        </Container>
      </section>
    </PageLayout>
  );
}
