import Link from "next/link";
import { requireAdmin } from "@/backend/auth/session";
import { getPrisma } from "@/backend/database/prisma";
import { PageLayout } from "@/components/common";
import { Container, Card, PriceDisplay, Badge } from "@/components/ui";
import { Icon } from "@/components/ui/Icon";

export const dynamic = "force-dynamic";

const APPROVED_STATUSES = ["CONFIRMED", "PROCESSING", "SHIPPED", "DELIVERED"] as const;
const CANCELLED_STATUSES = ["CANCELLED", "REFUNDED"] as const;

const STATUS_LABELS: Record<string, string> = {
  PENDING: "در انتظار",
  CONFIRMED: "تأییدشده",
  PROCESSING: "در حال پردازش",
  SHIPPED: "ارسال‌شده",
  DELIVERED: "تحویل‌شده",
  CANCELLED: "لغوشده",
  REFUNDED: "مسترد",
};

const fa = (n: number) => n.toLocaleString("fa-IR");

export default async function AdminPage() {
  await requireAdmin();
  const p = getPrisma();

  const [users, products, revenue, statusGroups, pendingReceipts, recentOrders] = await Promise.all(
    [
      p.user.count({ where: { deletedAt: null } }),
      p.product.count({ where: { deletedAt: null } }),
      p.order.aggregate({
        _sum: { totalAmount: true },
        where: { status: { in: [...APPROVED_STATUSES] } },
      }),
      p.order.groupBy({ by: ["status"], _count: { _all: true }, where: { deletedAt: null } }),
      p.paymentReceipt.count({ where: { status: "PENDING" } }),
      p.order.findMany({
        where: { deletedAt: null },
        orderBy: { createdAt: "desc" },
        take: 8,
        include: { payments: { take: 1, orderBy: { createdAt: "desc" } } },
      }),
    ],
  );

  const countOf = (s: string) => statusGroups.find((g) => g.status === s)?._count._all ?? 0;
  const totalOrders = statusGroups.reduce((sum, g) => sum + g._count._all, 0);
  const approved = APPROVED_STATUSES.reduce((sum, s) => sum + countOf(s), 0);
  const cancelled = CANCELLED_STATUSES.reduce((sum, s) => sum + countOf(s), 0);
  const pending = countOf("PENDING");
  const pct = (n: number) => (totalOrders ? Math.round((n / totalOrders) * 100) : 0);

  return (
    <PageLayout>
      <section className="admin-page">
        <Container>
          <header className="admin-header">
            <h1 className="admin-title">داشبورد مدیریت</h1>
            <p className="admin-subtitle">نمای کلی فروشگاه La Femme</p>
          </header>

          {/* کارت‌های آماری اصلی */}
          <div className="admin-stats">
            <Card className="admin-stat">
              <span className="admin-stat-icon">
                <Icon name="receipt" size={28} />
              </span>
              <span className="admin-stat-value">{fa(totalOrders)}</span>
              <span className="admin-stat-label">کل سفارش‌ها</span>
            </Card>
            <Card className="admin-stat admin-stat--success">
              <span className="admin-stat-icon">
                <Icon name="check" size={28} />
              </span>
              <span className="admin-stat-value">{fa(approved)}</span>
              <span className="admin-stat-label">تأییدشده</span>
            </Card>
            <Card className="admin-stat admin-stat--danger">
              <span className="admin-stat-icon">
                <Icon name="x" size={28} />
              </span>
              <span className="admin-stat-value">{fa(cancelled)}</span>
              <span className="admin-stat-label">لغو / مسترد</span>
            </Card>
            <Card className="admin-stat admin-stat--warn">
              <span className="admin-stat-icon">
                <Icon name="clock" size={28} />
              </span>
              <span className="admin-stat-value">{fa(pending)}</span>
              <span className="admin-stat-label">در انتظار</span>
            </Card>
          </div>

          <div className="admin-two-col">
            {/* نمای وضعیت سفارش‌ها */}
            <Card className="admin-panel">
              <div className="admin-panel-head">
                <h2>وضعیت سفارش‌ها</h2>
                <Link href="/admin/orders" className="admin-link-more">
                  همه سفارش‌ها ←
                </Link>
              </div>

              <div
                className="status-bar"
                role="img"
                aria-label={`تأییدشده ${pct(approved)} درصد، لغوشده ${pct(cancelled)} درصد`}
              >
                <span
                  className="status-bar-seg seg-approved"
                  style={{ width: `${pct(approved)}%` }}
                />
                <span
                  className="status-bar-seg seg-pending"
                  style={{ width: `${pct(pending)}%` }}
                />
                <span
                  className="status-bar-seg seg-cancelled"
                  style={{ width: `${pct(cancelled)}%` }}
                />
              </div>
              <div className="status-legend">
                <span>
                  <i className="dot seg-approved" /> تأییدشده {fa(pct(approved))}٪
                </span>
                <span>
                  <i className="dot seg-pending" /> در انتظار {fa(pct(pending))}٪
                </span>
                <span>
                  <i className="dot seg-cancelled" /> لغوشده {fa(pct(cancelled))}٪
                </span>
              </div>

              <div className="status-breakdown">
                {Object.keys(STATUS_LABELS).map((s) => (
                  <div key={s} className="status-row">
                    <span>{STATUS_LABELS[s]}</span>
                    <b>{fa(countOf(s))}</b>
                  </div>
                ))}
              </div>
            </Card>

            {/* درآمد و اقدامات سریع */}
            <div className="admin-side">
              <Card className="admin-revenue">
                <span className="admin-stat-label">فروش ثبت‌شده (سفارش‌های تأییدشده)</span>
                <PriceDisplay value={Number(revenue._sum.totalAmount || 0)} />
                <div className="admin-mini-stats">
                  <div>
                    <b>{fa(products)}</b>
                    <span>محصول</span>
                  </div>
                  <div>
                    <b>{fa(users)}</b>
                    <span>کاربر</span>
                  </div>
                </div>
              </Card>

              <Card className="admin-panel">
                <div className="admin-panel-head">
                  <h2>رسیدهای در انتظار</h2>
                  {pendingReceipts > 0 && <Badge tone="gold">{fa(pendingReceipts)}</Badge>}
                </div>
                <p className="admin-item-sub">
                  {pendingReceipts > 0
                    ? `${fa(pendingReceipts)} رسید کارت‌به‌کارت منتظر بررسی است.`
                    : "رسید جدیدی برای بررسی وجود ندارد."}
                </p>
                <Link href="/admin/payment-receipts" className="btn btn-primary mt-3 inline-block">
                  بررسی رسیدها
                </Link>
              </Card>
            </div>
          </div>

          {/* آخرین سفارش‌ها */}
          <Card className="admin-panel mt-6">
            <div className="admin-panel-head">
              <h2>آخرین سفارش‌ها</h2>
              <Link href="/admin/orders" className="admin-link-more">
                مشاهده همه ←
              </Link>
            </div>
            <div className="admin-orders-table">
              {recentOrders.length === 0 && (
                <p className="admin-item-sub">هنوز سفارشی ثبت نشده است.</p>
              )}
              {recentOrders.map((o) => (
                <Link key={o.id} href={`/admin/orders/${o.id}`} className="admin-order-row">
                  <span className="order-num" dir="ltr">
                    {o.orderNumber}
                  </span>
                  <span className="order-cust">{o.customerName}</span>
                  <Badge
                    tone={
                      APPROVED_STATUSES.includes(o.status as (typeof APPROVED_STATUSES)[number])
                        ? "success"
                        : CANCELLED_STATUSES.includes(
                              o.status as (typeof CANCELLED_STATUSES)[number],
                            )
                          ? "danger"
                          : "gold"
                    }
                  >
                    {STATUS_LABELS[o.status] ?? o.status}
                  </Badge>
                  <span className="order-total">
                    <PriceDisplay value={Number(o.totalAmount)} />
                  </span>
                </Link>
              ))}
            </div>
          </Card>
        </Container>
      </section>
    </PageLayout>
  );
}
