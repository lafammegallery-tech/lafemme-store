import Image from "next/image";
import Link from "next/link";
import { requireAdmin } from "@/backend/auth/session";
import { getPrisma } from "@/backend/database/prisma";
import { reviewReceiptAction } from "@/app/actions/admin";
import { PageLayout, PageHero } from "@/components/common";
import { Container, Card, Button, Badge, PriceDisplay } from "@/components/ui";

export const dynamic = "force-dynamic";

const STATUS: Record<string, { label: string; tone: "gold" | "success" | "danger" | "neutral" }> = {
  PENDING: { label: "در انتظار بررسی", tone: "gold" },
  APPROVED: { label: "تأییدشده", tone: "success" },
  REJECTED: { label: "ردشده", tone: "danger" },
};

export default async function Page({ searchParams }: { searchParams: Promise<{ status?: string }> }) {
  await requireAdmin();
  const { status } = await searchParams;
  const filter = status && ["PENDING", "APPROVED", "REJECTED"].includes(status) ? status : "PENDING";

  const rows = await getPrisma().paymentReceipt.findMany({
    where: { status: filter as "PENDING" | "APPROVED" | "REJECTED" },
    include: { order: true },
    orderBy: { createdAt: "desc" },
    take: 100,
  });

  const tabs = [
    { key: "PENDING", label: "در انتظار" },
    { key: "APPROVED", label: "تأییدشده" },
    { key: "REJECTED", label: "ردشده" },
  ];

  return (
    <PageLayout>
      <PageHero title="رسیدهای پرداخت" description="بررسی و تأیید رسیدهای کارت‌به‌کارت مشتریان" />
      <section className="py-8">
        <Container>
          <div className="admin-tabs">
            {tabs.map((t) => (
              <Link key={t.key} href={`/admin/payment-receipts?status=${t.key}`} className={`admin-tab${filter === t.key ? " active" : ""}`}>
                {t.label}
              </Link>
            ))}
          </div>

          <div className="receipt-grid">
            {rows.length === 0 && <Card className="p-6 text-center admin-empty">رسیدی در این وضعیت وجود ندارد.</Card>}
            {rows.map((r) => (
              <Card key={r.id} className="receipt-card">
                <a href={r.imageUrl} target="_blank" rel="noreferrer" className="receipt-card-image">
                  <Image src={r.imageUrl} alt="رسید پرداخت" width={280} height={340} style={{ objectFit: "cover", width: "100%", height: "auto" }} unoptimized />
                </a>
                <div className="receipt-card-body">
                  <div className="admin-item-head">
                    <Link href={`/admin/orders/${r.orderId}`} className="receipt-order-link" dir="ltr">
                      {r.order.orderNumber}
                    </Link>
                    <Badge tone={STATUS[r.status].tone}>{STATUS[r.status].label}</Badge>
                  </div>
                  <p className="admin-item-sub">{r.order.customerName} • {r.order.customerPhone}</p>
                  <PriceDisplay value={Number(r.order.totalAmount)} />
                  {r.note && <p className="admin-item-sub">یادداشت: {r.note}</p>}

                  {r.status === "PENDING" && (
                    <div className="receipt-actions">
                      <form action={reviewReceiptAction} className="receipt-action-form">
                        <input type="hidden" name="id" value={r.id} />
                        <input type="hidden" name="decision" value="approve" />
                        <Button type="submit" size="sm">تأیید و ثبت سفارش</Button>
                      </form>
                      <form action={reviewReceiptAction} className="receipt-action-form">
                        <input type="hidden" name="id" value={r.id} />
                        <input type="hidden" name="decision" value="reject" />
                        <input name="note" placeholder="دلیل رد (اختیاری)" className="receipt-note-input" />
                        <Button type="submit" variant="danger" size="sm">رد</Button>
                      </form>
                    </div>
                  )}
                </div>
              </Card>
            ))}
          </div>
        </Container>
      </section>
    </PageLayout>
  );
}
