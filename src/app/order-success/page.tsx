import Link from "next/link";
import { startPaymentAction } from "@/app/actions/payment";
import { PageLayout, PageHero } from "@/components/common";
import { Container, Card, Button } from "@/components/ui";
import { ReceiptUploader } from "@/components/checkout";
import { getPrisma } from "@/backend/database/prisma";

export const dynamic = "force-dynamic";

export default async function Page({ searchParams }: { searchParams: Promise<{ order?: string }> }) {
  const { order } = await searchParams;

  const orderRow = order
    ? await getPrisma().order.findUnique({
        where: { orderNumber: order },
        include: { payments: { orderBy: { createdAt: "desc" }, take: 1 }, receipts: true },
      })
    : null;

  const payment = orderRow?.payments[0];
  const isCardToCard = payment?.method === "CARD_TO_CARD";
  const hasReceipt = (orderRow?.receipts.length ?? 0) > 0;

  const cardConfig = isCardToCard
    ? await getPrisma().paymentMethodConfig.findFirst({
        where: { type: "CARD_TO_CARD", isActive: true, ...(orderRow?.paymentMethodName ? { name: orderRow.paymentMethodName } : {}) },
        orderBy: { sortOrder: "asc" },
      })
    : null;

  return (
    <PageLayout>
      <PageHero title="سفارش ثبت شد" description="درخواست خرید شما با موفقیت ثبت شد." />
      <section className="py-16">
        <Container>
          <Card className="p-8 text-center order-success-card">
            <p>
              شماره سفارش: <strong dir="ltr">{order || "-"}</strong>
            </p>

            {isCardToCard ? (
              <div className="mt-6 text-right">
                {cardConfig?.cardNumber && (
                  <div className="card-info-box">
                    <p className="card-info-title">لطفاً مبلغ سفارش را به کارت زیر واریز کنید:</p>
                    <p className="card-info-number" dir="ltr">{cardConfig.cardNumber}</p>
                    {cardConfig.cardHolder && <p className="card-info-line">به نام: {cardConfig.cardHolder}</p>}
                    {cardConfig.bankName && <p className="card-info-line">بانک: {cardConfig.bankName}</p>}
                  </div>
                )}
                <div className="mt-6">{order && <ReceiptUploader orderNumber={order} alreadyUploaded={hasReceipt} />}</div>
              </div>
            ) : (
              <>
                <p className="mt-3">برای آزمایش چرخه کامل سفارش، پرداخت شبیه‌سازی‌شده را اجرا کنید.</p>
                {order && (
                  <form action={startPaymentAction} className="mt-6">
                    <input type="hidden" name="orderNumber" value={order} />
                    <Button type="submit">پرداخت آزمایشی موفق</Button>
                  </form>
                )}
              </>
            )}

            <Link className="btn btn-secondary mt-6 inline-block" href="/orders">
              مشاهده سفارش‌ها
            </Link>
          </Card>
        </Container>
      </section>
    </PageLayout>
  );
}
