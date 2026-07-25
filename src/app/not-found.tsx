import Link from "next/link";
import { PageLayout } from "@/components/common";
import { ButtonLink, Container, ErrorState } from "@/components/ui";
/** صفحه ۴۰۴ قابل دسترس برای مسیرهای نامعتبر. */
export default function NotFound() {
  return (
    <PageLayout>
      <section className="py-24">
        <Container>
          <ErrorState
            title="صفحه پیدا نشد"
            description="ممکن است آدرس تغییر کرده باشد یا صفحه حذف شده باشد."
            action={<ButtonLink href="/">بازگشت به صفحه اصلی</ButtonLink>}
          />
          <p className="mt-6 text-center">
            <Link href="/search">یا در سایت جست‌وجو کنید</Link>
          </p>
        </Container>
      </section>
    </PageLayout>
  );
}
