import type { Metadata } from "next";
import { ForgotPasswordForm } from "@/components/auth/AuthForms";
import { AuthCard } from "@/components/auth/AuthCard";
import { PageHero, PageLayout } from "@/components/common";
import { Container } from "@/components/ui";
export const metadata: Metadata = {
  title: "بازیابی رمز عبور",
  description: "بازیابی نمایشی رمز عبور",
  alternates: { canonical: "/forgot-password" },
  robots: { index: false, follow: true },
};
/** صفحه بازیابی رمز عبور بدون ارسال واقعی پیامک. */
export default function ForgotPasswordPage() {
  return (
    <PageLayout>
      <PageHero title="بازیابی رمز عبور" />
      <section className="py-16">
        <Container>
          <AuthCard title="دریافت کد بازیابی">
            <ForgotPasswordForm />
          </AuthCard>
        </Container>
      </section>
    </PageLayout>
  );
}
