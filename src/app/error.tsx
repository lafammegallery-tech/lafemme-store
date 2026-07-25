"use client";
import { Button, ErrorState } from "@/components/ui";
/** مرز خطای عمومی؛ امکان تلاش مجدد بدون بارگذاری کامل صفحه را فراهم می‌کند. */
export default function GlobalError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <main className="grid min-h-screen place-items-center p-6">
      <ErrorState
        title="خطایی رخ داد"
        description="لطفاً دوباره تلاش کنید."
        action={<Button onClick={reset}>تلاش مجدد</Button>}
      />
    </main>
  );
}
