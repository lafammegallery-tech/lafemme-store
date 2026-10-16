import Link from "next/link";
import { requireAdmin } from "@/backend/auth/session";
import { getPrisma } from "@/backend/database/prisma";
import { PageLayout, PageHero } from "@/components/common";
import { Container, Card, PriceDisplay } from "@/components/ui";

export const dynamic = "force-dynamic";
export default async function Page() {
  await requireAdmin();
  const rows = await getPrisma().order.findMany({ where: { deletedAt: null }, include: { payments: true, shipment: true, receipts: { where: { status: "PENDING" } } }, orderBy: { createdAt: "desc" }, take: 100 });
  return <PageLayout><PageHero title="مدیریت سفارش‌ها" description="پیش‌پرداخت ۱۰٪، تعیین مقصد مانده و تأیید نهایی" /><section className="py-12"><Container><div className="grid gap-4">{rows.map(o => {
    const deposit = o.payments.find(p => p.stage === "DEPOSIT");
    const balance = o.payments.find(p => p.stage === "BALANCE");
    const progress = !o.twoStagePayment ? "پرداخت تک‌مرحله‌ای" : balance?.status === "SUCCESS" ? "تسویه کامل و تأیید نهایی" : deposit?.status === "SUCCESS" ? "تأیید اولیه؛ منتظر تسویهٔ مانده" : "منتظر پیش‌پرداخت و تأیید اولیه";
    return <Link key={o.id} href={`/admin/orders/${o.id}`}><Card className="p-5"><div className="flex flex-wrap justify-between gap-3"><div><h2>{o.orderNumber}</h2><p>{o.customerName} • {o.customerPhone}</p><p>{progress}</p><p>وضعیت سفارش: {o.status} • ارسال: {o.shipment?.status ?? "—"}</p>{o.receipts.length > 0 && <p>رسید در انتظار بررسی: {o.receipts.length.toLocaleString("fa-IR")} تصویر</p>}</div><PriceDisplay value={Number(o.totalAmount)} /></div></Card></Link>;
  })}</div></Container></section></PageLayout>;
}
