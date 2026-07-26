import type { Metadata } from "next";
import Link from "next/link";
import { PageLayout } from "@/components/common";
import { AccountLayout } from "@/components/account/AccountLayout";
import { Card, EmptyState, PriceDisplay } from "@/components/ui";
import { requireSession } from "@/backend/auth/session";
import { orderRepository } from "@/backend/database/repositories/order.repository";
export const metadata: Metadata={title:"سفارش‌ها | La Femme",robots:{index:false,follow:false}}; export const dynamic="force-dynamic";
export default async function OrdersPage(){const s=await requireSession("/orders");const orders=await orderRepository.findByUserId(s.userId,50);return <PageLayout><AccountLayout><Card className="p-6"><h1>سفارش‌های من</h1>{orders.length?<div className="overflow-x-auto"><table className="orders-table"><thead><tr><th>شماره</th><th>تاریخ</th><th>مبلغ</th><th>وضعیت</th><th></th></tr></thead><tbody>{orders.map(o=><tr key={o.id}><td>{o.orderNumber}</td><td>{new Intl.DateTimeFormat("fa-IR").format(o.createdAt)}</td><td><PriceDisplay value={Number(o.totalAmount)}/></td><td>{o.status}</td><td><Link href={`/orders/${o.id}`}>جزئیات</Link></td></tr>)}</tbody></table></div>:<EmptyState title="هنوز سفارشی ثبت نشده است"/>}</Card></AccountLayout></PageLayout>}
