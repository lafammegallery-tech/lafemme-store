import { notFound } from "next/navigation";
import { requireAdmin } from "@/backend/auth/session";
import { getPrisma } from "@/backend/database/prisma";
import { updateOrderStatusAction } from "@/app/actions/admin";
import { PageLayout, PageHero } from "@/components/common";
import { Container, Card, Button, PriceDisplay } from "@/components/ui";

export const dynamic = "force-dynamic";

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  await requireAdmin();
  const { id } = await params;
  const o = await getPrisma().order.findUnique({
    where: { id },
    include: { items: true, payments: true, shipment: true, statusHistory: { orderBy: { createdAt: "desc" } } },
  });
  if (!o) notFound();

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
              <h3 className="mt-5">اقلام</h3>
              {o.items.map((i) => (
                <p key={i.id}>
                  {i.productName} × {i.quantity}
                </p>
              ))}
            </Card>
            <Card className="p-6">
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
