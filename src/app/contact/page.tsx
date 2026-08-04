import type { Metadata } from "next";
import { ContactForm } from "@/components/content/ContactForm";
import { PageHero, PageLayout } from "@/components/common";
import { Card, Container } from "@/components/ui";

export const metadata: Metadata = {
  title: "تماس با ما | La Femme Gold",
  description: "راه‌های ارتباط با مجموعه La Femme Gold — تهران، بازار بزرگ، پاساژ اردیبهشت",
  alternates: { canonical: "/contact" },
  openGraph: { title: "تماس با La Femme Gold", description: "راه‌های ارتباط با مجموعه La Femme Gold" },
};

export default function ContactPage() {
  return (
    <PageLayout>
      <PageHero
        title="تماس با ما"
        description="برای مشاوره خرید، استعلام قیمت و پشتیبانی با ما در ارتباط باشید."
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
              <div className="mt-6" style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>

                <div style={{ display: "flex", gap: "0.75rem", alignItems: "flex-start" }}>
                  <span style={{ fontSize: "1.25rem" }}>📞</span>
                  <div>
                    <p style={{ fontWeight: 600, marginBottom: "0.2rem" }}>تلفن</p>
                    <a href="tel:02155622804" dir="ltr" style={{ color: "var(--color-gold)", textDecoration: "none" }}>
                      ۰۲۱–۵۵۶۲۲۸۰۴
                    </a>
                  </div>
                </div>

                <div style={{ display: "flex", gap: "0.75rem", alignItems: "flex-start" }}>
                  <span style={{ fontSize: "1.25rem" }}>📍</span>
                  <div>
                    <p style={{ fontWeight: 600, marginBottom: "0.2rem" }}>نشانی</p>
                    <p style={{ color: "var(--color-gray)", lineHeight: 1.7 }}>
                      تهران، بازار بزرگ، پاساژ اردیبهشت، پلاک ۲/۳۱
                    </p>
                  </div>
                </div>

                <div style={{ display: "flex", gap: "0.75rem", alignItems: "flex-start" }}>
                  <span style={{ fontSize: "1.25rem" }}>📸</span>
                  <div>
                    <p style={{ fontWeight: 600, marginBottom: "0.2rem" }}>اینستاگرام</p>
                    <a
                      href="https://instagram.com/lafemmegold"
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ color: "var(--color-gold)", textDecoration: "none" }}
                    >
                      @lafemmegold
                    </a>
                  </div>
                </div>

                <div style={{ display: "flex", gap: "0.75rem", alignItems: "flex-start" }}>
                  <span style={{ fontSize: "1.25rem" }}>🕐</span>
                  <div>
                    <p style={{ fontWeight: 600, marginBottom: "0.2rem" }}>ساعات کاری</p>
                    <p style={{ color: "var(--color-gray)", lineHeight: 1.7 }}>
                      شنبه تا پنجشنبه، ۹ صبح تا ۶ عصر
                    </p>
                  </div>
                </div>

              </div>
            </Card>
          </div>
        </Container>
      </section>
    </PageLayout>
  );
}
