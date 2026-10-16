import Image from "next/image";
import { notFound } from "next/navigation";
import { requireAdmin } from "@/backend/auth/session";
import { getPrisma } from "@/backend/database/prisma";
import { updateOrderStatusAction } from "@/app/actions/admin";
import { PageLayout, PageHero } from "@/components/common";
import { Container, Card, Button, PriceDisplay, Badge } from "@/components/ui";
import { DestinationForm, ReviewBundleForm } from "@/components/admin/StagedPaymentForms";
import { destinationSnapshot, STAGE_LABELS } from "@/lib/staged-payment";

export const dynamic = "force-dynamic";

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  await requireAdmin();
  const { id } = await params;
  const o = await getPrisma().order.findUnique({
    where: { id },
    include: { items: true, payments: true, shipment: true, receipts: { orderBy: { createdAt: "desc" } }, statusHistory: { orderBy: { createdAt: "desc" } } },
  });
  if (!o) notFound();
  const depositApproved = o.payments.some(p => p.stage === "DEPOSIT" && p.status === "SUCCESS");
  const balance = o.payments.find(p => p.stage === "BALANCE");

  return (
    <PageLayout>
      <PageHero title={o.orderNumber} description="جزئیات و گردش وضعیت سفارش" />
      <section className="py-12">
        <Container>
          <div className="grid gap-6 lg:grid-cols-2">
            <Card className="p-6">
              <h2>مشتری و مبلغ</h2>
              <p>
                {o.customerName} • {o.customerPhone}
              </p>
              <PriceDisplay value={Number(o.totalAmount)} />
              <p className="mt-3">روش پرداخت: {o.paymentMethodName ?? o.payments[0]?.method ?? "—"}</p>
              <p>روش ارسال: {o.shippingMethod ?? "—"}</p>
              <p>پرداخت: {o.twoStagePayment ? (balance?.status === "SUCCESS" ? "تأیید نهایی و تسویه‌شده" : depositApproved ? "تأیید اولیه انجام شده؛ منتظر تسویه" : "منتظر پیش‌پرداخت ۱۰٪ و تأیید اولیه") : "تک‌مرحله‌ای (سفارش قبلی)"}</p>
              <h3 className="mt-5">اقلام</h3>
              {o.items.map((i) => (
                <p key={i.id}>
                  {i.productName} × {i.quantity}
                </p>
              ))}
              {o.payments.sort((a, b) => a.stage === "DEPOSIT" ? -1 : b.stage === "DEPOSIT" ? 1 : 0).map(payment => {
                const receipts = o.receipts.filter(r => r.stage === payment.stage);
                const pending = receipts.filter(r => r.status === "PENDING");
                return <section key={payment.id} className="mt-6 border-t border-lf-border pt-5">
                  <h3>{STAGE_LABELS[payment.stage]}</h3>
                  <PriceDisplay value={Number(payment.amount)} />
                  {payment.stage === "BALANCE" && (destinationSnapshot(payment.metadata).cardNumber || destinationSnapshot(payment.metadata).iban) && <p>مقصد تسویه: <span dir="ltr">{destinationSnapshot(payment.metadata).cardNumber} {destinationSnapshot(payment.metadata).iban}</span> — {destinationSnapshot(payment.metadata).cardHolder}</p>}
                  <p>وضعیت: {payment.status === "SUCCESS" ? "تأیید شده" : pending.length ? "رسیدها در انتظار بررسی" : "در انتظار واریز و ارسال رسید"}</p>
                  <div className="order-receipts">
                    {receipts.map((r) => (
                      <a key={r.id} href={r.imageUrl} target="_blank" rel="noreferrer" className="order-receipt-thumb">
                        <Image src={r.imageUrl} alt="رسید" width={120} height={150} style={{ objectFit: "cover", width: "100%", height: "auto" }} unoptimized />
                        <Badge tone={r.status === "APPROVED" ? "success" : r.status === "REJECTED" ? "danger" : "gold"}>
                          {r.status === "APPROVED" ? "تأییدشده" : r.status === "REJECTED" ? "ردشده" : "در انتظار"}
                        </Badge>
                      </a>
                    ))}
                  </div>
                  {pending.length > 0 && o.status === "PENDING" && <ReviewBundleForm receiptId={pending[0].id} count={pending.length} deposit={payment.stage === "DEPOSIT"} />}
                </section>;
              })}
            </Card>
            <Card className="p-6">
              {o.twoStagePayment && balance && <section className="mb-8">
                <h2>مقصد ماندهٔ این سفارش</h2>
                <p>پس از تأیید اولیه با مشتری به شمارهٔ <span dir="ltr">{o.customerPhone}</span> هماهنگ کنید و کارت یا شبا را اینجا ثبت کنید. مشتری مقصد را در صفحهٔ پیگیری همان سفارش می‌بیند.</p>
                {depositApproved && o.status === "PENDING" && balance.status !== "SUCCESS" ? <DestinationForm key={o.paymentRevision} orderId={o.id} revision={o.paymentRevision} destination={destinationSnapshot(balance.metadata)} locked={o.receipts.some(r => r.stage === "BALANCE" && r.status === "PENDING")} /> : <p>{depositApproved ? "سفارش در این وضعیت قابل تغییر مقصد نیست." : "ابتدا پیش‌پرداخت ۱۰٪ را تأیید کنید."}</p>}
              </section>}
              <h2>تغییر وضعیت</h2>
              <form action={updateOrderStatusAction} className="grid gap-3">
                <input type="hidden" name="id" value={o.id} />
                <select name="status" defaultValue={o.status} className="input">
                  <option>PENDING</option>
                  <option>CONFIRMED</option>
                  <option>PROCESSING</option>
                  <option>SHIPPED</option>
                  <option>DELIVERED</option>
                  <option>CANCELLED</option>
                  <option>REFUNDED</option>
                </select>
                <textarea name="note" className="textarea" placeholder="یادداشت تغییر وضعیت" />
                <Button type="submit">ثبت وضعیت</Button>
              </form>
              <div className="mt-6">
                <h3>تاریخچه</h3>
                {o.statusHistory.map((h) => (
                  <p key={h.id}>
                    {h.fromStatus || "—"} ← {h.toStatus} {h.note && `• ${h.note}`}
                  </p>
                ))}
              </div>
            </Card>
          </div>
        </Container>
      </section>
    </PageLayout>
  );
}
