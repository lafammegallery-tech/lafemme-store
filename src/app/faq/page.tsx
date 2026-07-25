import type { Metadata } from "next";
import { PageHero, PageLayout } from "@/components/common";
import { Accordion, Container } from "@/components/ui";
import { faqItems } from "@/data/frontend";
export const metadata: Metadata = {
  title: "سؤالات متداول | La Femme",
  description: "پاسخ پرسش‌های متداول درباره محصولات و خدمات La Femme",
  alternates: { canonical: "/faq" },
};
/** صفحه پرسش‌های متداول با Accordion قابل دسترس. */
export default function FaqPage() {
  return (
    <PageLayout>
      <PageHero title="سؤالات متداول" />
      <section className="py-16">
        <Container>
          <Accordion items={faqItems} />
        </Container>
      </section>
    </PageLayout>
  );
}
