"use client";

import { useEffect, useTransition } from "react";
import { useRouter } from "next/navigation";

export function PaymentRefresh() {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  useEffect(() => {
    const timer = window.setInterval(() => { if (!document.hidden) router.refresh(); }, 30_000);
    return () => window.clearInterval(timer);
  }, [router]);
  return <button type="button" className="btn btn-secondary mt-4" disabled={pending} onClick={() => startTransition(() => router.refresh())}>{pending ? "در حال دریافت…" : "تازه‌سازی وضعیت پرداخت"}</button>;
}
