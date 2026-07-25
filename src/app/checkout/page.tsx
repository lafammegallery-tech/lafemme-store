import type { Metadata } from "next";
import { CheckoutSteps, CheckoutForm, OrderSummary } from "@/components/checkout";
import { PageHero, PageLayout } from "@/components/common";
import { Container } from "@/components/ui";
import { cartToView, getCurrentCart } from "@/backend/services/cart.service";
export const metadata: Metadata = { title: "تسویه حساب | La Femme", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";
export default async function CheckoutPage() { const items=cartToView(await getCurrentCart()); const total=items.reduce((s,i)=>s+i.price*i.quantity,0); return <PageLayout><PageHero title="تسویه حساب" description="اطلاعات خود را برای تکمیل سفارش وارد کنید" /><section className="py-16"><Container><CheckoutSteps currentStep={1}/><div className="checkout-layout"><div className="checkout-form-section"><CheckoutForm /></div><div className="checkout-summary-section"><OrderSummary items={items} total={total}/></div></div></Container></section></PageLayout>; }
