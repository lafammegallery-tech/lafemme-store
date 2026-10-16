import Link from "next/link";
import { formatMoney } from "@/lib/format-money";
import { PageLayout, PageHero } from "@/components/common";
import { Container, Card } from "@/components/ui";
import { ReceiptUploader } from "@/components/checkout";
import { PaymentRefresh } from "@/components/checkout/PaymentRefresh";
import { getPrisma } from "@/backend/database/prisma";
import { canAccessOrder } from "@/backend/auth/order-access";
import { notFound } from "next/navigation";
import { destinationSnapshot, STAGE_LABELS } from "@/lib/staged-payment";

export const dynamic = "force-dynamic";

export default async function Page({ searchParams }: { searchParams: Promise<{ order?: string }> }) {
  const { order } = await searchParams;
  const row = order ? await getPrisma().order.findUnique({ where: { orderNumber: order }, include: { payments: true, receipts: { orderBy: { createdAt: "desc" } } } }) : null;
  if (!row || row.deletedAt || !(await canAccessOrder(row, true))) notFound();
  const depositApproved = row.payments.some(p => p.stage === "DEPOSIT" && p.status === "SUCCESS");
  const active = row.status === "PENDING";
  return (
    <PageLayout>
      <PageHero title={row.twoStagePayment ? "پیگیری پرداخت دو مرحله‌ای" : "پیگیری پرداخت سفارش"} description="تأیید اولیهٔ پیش‌پرداخت و تأیید نهایی تسویه به‌صورت جداگانه انجام می‌شود." />
      <section className="py-16"><Container><Card className="p-6 sm:p-8 order-success-card space-y-6">
        <p>شماره سفارش: <strong dir="ltr">{row.orderNumber}</strong></p>
        <p>جمع نهایی سفارش: <strong>{formatMoney(Number(row.totalAmount))} تومان</strong></p>
        <p>وضعیت سفارش: {row.status === "PENDING" ? (row.twoStagePayment ? (depositApproved ? "تأیید اولیه انجام شده؛ در انتظار تسویه" : "در انتظار پرداخت و تأیید اولیه") : "در انتظار بررسی پرداخت کامل") : row.status === "CONFIRMED" ? "تأیید نهایی و تسویه کامل" : row.status}</p>
        {active && !depositApproved && <p>فیش پیش‌پرداخت را تا ۲۴ ساعت ارسال کنید. تأیید وصول وجه توسط مدیر انجام می‌شود؛ ثبت درخواست به‌تنهایی تأیید خرید نیست.</p>}
        {row.twoStagePayment && <p>ابتدا فقط ۱۰٪ جمع نهایی را به کارت مرحلهٔ اول واریز و تصویر فیش‌ها را ارسال کنید. پس از تأیید اولیه، برای هماهنگی مانده با پشتیبانی تماس بگیرید یا منتظر تماس فروشگاه باشید. مدیر، کارت یا شبای اختصاصی همین سفارش را در مرحلهٔ دوم اعلام می‌کند. قبل از نمایش مقصد مرحلهٔ دوم، مانده را واریز نکنید.</p>}
        <p><Link href="/contact" className="underline">راه‌های تماس و هماهنگی پرداخت</Link> — شمارهٔ تماس ثبت‌شدهٔ شما: <span dir="ltr">{row.customerPhone}</span></p>
        <PaymentRefresh />
        {row.payments.sort((a, b) => ({ FULL: 0, DEPOSIT: 1, BALANCE: 2 }[a.stage] - { FULL: 0, DEPOSIT: 1, BALANCE: 2 }[b.stage])).map(payment => {
          const receipts = row.receipts.filter(r => r.stage === payment.stage);
          const pending = receipts.some(r => r.status === "PENDING");
          const destination = destinationSnapshot(payment.metadata);
          const unlocked = payment.stage !== "BALANCE" || depositApproved;
          const hasDestination = Boolean(destination.cardNumber || destination.iban);
          const canUpload = active && unlocked && hasDestination && ["PENDING", "PROCESSING"].includes(payment.status) && !pending;
          return <section key={payment.id} className="rounded-xl border border-lf-border p-5 space-y-4" aria-label={STAGE_LABELS[payment.stage]}>
            <h2>{STAGE_LABELS[payment.stage]}</h2>
            <p className="text-xl">مبلغ این مرحله: <strong>{formatMoney(Number(payment.amount))} تومان</strong></p>
            {payment.status === "SUCCESS" ? <p className="receipt-success">✓ {payment.stage === "DEPOSIT" ? "پیش‌پرداخت تأیید شد؛ این تأیید به معنی تسویه کامل نیست." : "پرداخت این مرحله تأیید شد."}</p> : !active ? <p>سفارش در این وضعیت قابل واریز نیست؛ برای پیگیری با پشتیبانی هماهنگ کنید.</p> : !unlocked ? <p>این مرحله پس از تأیید اولیهٔ پیش‌پرداخت فعال می‌شود.</p> : !hasDestination ? <p role="status">منتظر اعلام کارت یا شبا توسط مدیر هستید. برای هماهنگی تماس بگیرید؛ مبلغ مانده را فعلاً به کارت پیش‌پرداخت واریز نکنید.</p> : <>
              <div className="card-info-box">
                <p>مقصد واریز {payment.stage === "DEPOSIT" ? "فقط پیش‌پرداخت ۱۰٪" : payment.stage === "BALANCE" ? "فقط ماندهٔ همین سفارش" : "مبلغ کامل"}:</p>
                {destination.cardNumber && <p>کارت: <strong dir="ltr" className="break-all">{destination.cardNumber}</strong></p>}
                {destination.iban && <p>شبا: <strong dir="ltr" className="break-all">{destination.iban}</strong></p>}
                {destination.cardHolder && <p>به نام: {destination.cardHolder}</p>}
                {destination.bankName && <p>بانک: {destination.bankName}</p>}
              </div>
              {pending && <p role="status">تمام تصاویر این مرحله در انتظار بررسی مدیر است؛ دوباره واریز نکنید.</p>}
            </>}
            {receipts.length > 0 && <div><h3>فیش‌های ارسال‌شدهٔ این مرحله</h3><ul className="space-y-2">{receipts.map((r, i) => <li key={r.id}><a className="underline" href={r.imageUrl} target="_blank" rel="noreferrer">مشاهدهٔ تصویر {i + 1}</a> — {r.status === "APPROVED" ? "تأییدشده" : r.status === "REJECTED" ? "ردشده" : "در انتظار بررسی"}{r.note && <p>توضیح مدیر: {r.note}</p>}</li>)}</ul></div>}
            {canUpload && <ReceiptUploader key={`${payment.id}-${row.paymentRevision}`} orderNumber={row.orderNumber} stage={payment.stage} revision={row.paymentRevision} />}
          </section>;
        })}
        <Link className="btn btn-secondary inline-block" href="/orders">مشاهده سفارش‌ها</Link>
      </Card></Container></section>
    </PageLayout>
  );
}
