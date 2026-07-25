import type { Metadata } from "next";
import Link from "next/link";
import { LoginForm } from "@/components/auth/AuthForms";
import { AuthCard } from "@/components/auth/AuthCard";
import { PageHero, PageLayout } from "@/components/common";
import { Container } from "@/components/ui";

export const metadata: Metadata = {
  title: "ورود | La Femme",
  description: "ورود امن به حساب کاربری La Femme",
  alternates: { canonical: "/login" },
};
/** صفحه ورود متصل به احراز هویت واقعی. */
export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const params = await searchParams;
  const nextPath = params.next?.startsWith("/") && !params.next.startsWith("//")
    ? params.next
    : "";
  return (
    <PageLayout>
      <PageHero
        title="ورود به حساب کاربری"
        description="برای مشاهده سفارش‌ها و ادامه خرید وارد حساب خود شوید."
      />
      <section className="py-16">
        <Container>
          <AuthCard
            title="ورود"
            footer={
              <>
                <Link href="/forgot-password">رمز عبور را فراموش کرده‌اید؟</Link>
                <p className="mt-3">
                  حساب ندارید؟ <Link href="/register">ثبت‌نام</Link>
                </p>
              </>
            }
          >
            <LoginForm nextPath={nextPath} />
          </AuthCard>
        </Container>
      </section>
    </PageLayout>
  );
}
