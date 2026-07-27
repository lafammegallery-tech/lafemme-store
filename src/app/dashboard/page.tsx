import type { Metadata } from "next";
import Link from "next/link";
import { AccountLayout } from "@/components/account/AccountLayout";
import { PageLayout } from "@/components/common";
import { Card, EmptyState, PriceDisplay } from "@/components/ui";
import { requireSession } from "@/backend/auth/session";
import { userRepository } from "@/backend/database/repositories/user.repository";
import { orderRepository } from "@/backend/database/repositories/order.repository";
import { logoutAction } from "@/app/actions/auth";
export const metadata: Metadata = { title: "داشبورد | La Femme", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";
export default async function DashboardPage() {
  const session=await requireSession(); const [user,orders]=await Promise.all([userRepository.findById(session.userId),orderRepository.findByUserId(session.userId,5)]);
  const isAdmin = session.role === "ADMIN" || session.role === "STAFF";
  return <PageLayout><AccountLayout><Card className="dashboard-card p-6"><div className="flex justify-between gap-4"><div><h1>سلام {user?.firstName || "کاربر عزیز"} 👋</h1><p>به پنل کاربری La Femme خوش آمدید.</p></div><form action={logoutAction}><button className="btn btn-secondary">خروج</button></form></div></Card>{isAdmin && <Card className="dashboard-card p-6"><div className="flex flex-wrap items-center justify-between gap-4"><div><h2>دسترسی مدیریت</h2><p>شما به پنل مدیریت فروشگاه دسترسی دارید.</p></div><Link className="btn btn-primary" href="/admin">ورود به پنل مدیریت</Link></div></Card>}<div className="dashboard-stats"><Card className="stat-card"><h3>تعداد سفارش‌ها</h3><span>{orders.length.toLocaleString("fa-IR")}</span></Card><Card className="stat-card"><h3>در حال پردازش</h3><span>{orders.filter(o=>["PENDING","CONFIRMED","PROCESSING"].includes(o.status)).length.toLocaleString("fa-IR")}</span></Card><Card className="stat-card"><h3>آدرس‌ها</h3><span>{(user?.addresses.length||0).toLocaleString("fa-IR")}</span></Card></div><Card className="dashboard-card p-6"><h2>آخرین سفارش‌ها</h2>{orders.length?<div className="overflow-x-auto"><table className="orders-table"><thead><tr><th>شماره</th><th>تاریخ</th><th>مبلغ</th><th>وضعیت</th></tr></thead><tbody>{orders.map(o=><tr key={o.id}><td><Link href={`/orders/${o.id}`}>{o.orderNumber}</Link></td><td>{new Intl.DateTimeFormat("fa-IR").format(o.createdAt)}</td><td><PriceDisplay value={Number(o.totalAmount)}/></td><td>{o.status}</td></tr>)}</tbody></table></div>:<EmptyState title="سفارشی وجود ندارد"/>}<Link className="btn btn-primary mt-5 inline-block" href="/orders">مشاهده همه سفارش‌ها</Link></Card></AccountLayout></PageLayout>;
}
