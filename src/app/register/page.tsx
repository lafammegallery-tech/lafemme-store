import type { Metadata } from "next";
import Link from "next/link";
import { RegisterForm } from "@/components/auth/AuthForms";
import { AuthCard } from "@/components/auth/AuthCard";
import { PageHero, PageLayout } from "@/components/common";
import { Container } from "@/components/ui";
export const metadata: Metadata = {
  title: "ثبت‌نام | La Femme",
  description: "ساخت حساب کاربری آزمایشی در La Femme",
  alternates: { canonical: "/register" },
};
/** صفحه ثبت‌نام نمایشی و آماده اتصال به Backend است. */
export default async function RegisterPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const { next } = await searchParams;
  return (
    <PageLayout>
      <PageHero title="ایجاد حساب کاربری" />
      <section className="py-16">
        <Container>
          <AuthCard
            title="ثبت‌نام"
            footer={
              <p>
                قبلاً ثبت‌نام کرده‌اید؟{" "}
                <Link href={next ? `/login?next=${encodeURIComponent(next)}` : "/login"}>ورود</Link>
              </p>
            }
          >
            <RegisterForm next={next} />
          </AuthCard>
        </Container>
      </section>
    </PageLayout>
  );
}
