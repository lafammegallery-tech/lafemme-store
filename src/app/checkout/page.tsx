import type { Metadata } from "next";
import { CheckoutSteps, CheckoutForm, OrderSummary } from "@/components/checkout";
import { PageHero, PageLayout } from "@/components/common";
import { Container } from "@/components/ui";
import { cartToView, getCurrentCart } from "@/backend/services/cart.service";
import { getPrisma } from "@/backend/database/prisma";
import { getPaymentPolicy } from "@/backend/services/payment-policy.service";

export const metadata: Metadata = { title: "تسویه حساب | La Femme", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

export default async function CheckoutPage() {
  const prisma = getPrisma();
  const [cart, paymentMethodsRaw, shippingMethodsRaw, policy] = await Promise.all([
    getCurrentCart(),
    prisma.paymentMethodConfig.findMany({ where: { isActive: true, type: "CARD_TO_CARD", cardNumber: { not: null } }, orderBy: { sortOrder: "asc" } }),
    prisma.shippingMethodConfig.findMany({ where: { isActive: true }, orderBy: { sortOrder: "asc" } }),
    getPaymentPolicy(),
  ]);
  const items = cartToView(cart);
  const total = items.reduce((s, i) => s + i.price * i.quantity, 0);

  const paymentMethods = paymentMethodsRaw.filter(m => /^\d{16}$/.test(m.cardNumber ?? "") && m.cardNumber !== "6037991234567890").map((m) => ({
    id: m.id,
    name: m.name,
    type: m.type,
    description: m.description,
    cardNumber: m.cardNumber,
    cardHolder: m.cardHolder,
    bankName: m.bankName,
    requiresReceipt: m.requiresReceipt,
    minimumAmount: Number(m.minimumAmount),
    maximumAmount: m.maximumAmount === null ? null : Number(m.maximumAmount),
  }));
  const shippingMethods = shippingMethodsRaw.map((m) => ({
    id: m.id,
    name: m.name,
    description: m.description,
    cost: Number(m.cost),
  }));

  return (
    <PageLayout>
      <PageHero title="تسویه حساب" description="اطلاعات خود را برای تکمیل سفارش وارد کنید" />
      <section className="py-16">
        <Container>
          <CheckoutSteps currentStep={1} />
          <div className="checkout-layout">
            <div className="checkout-form-section">
              <CheckoutForm paymentMethods={paymentMethods} shippingMethods={shippingMethods} subtotal={total} policy={policy} />
            </div>
            <div className="checkout-summary-section">
              <OrderSummary items={items} total={total} />
            </div>
          </div>
        </Container>
      </section>
    </PageLayout>
  );
}
