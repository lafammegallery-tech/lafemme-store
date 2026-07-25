import type { Metadata } from "next";
import { CartList, CartSummary } from "@/components/cart";
import { PageHero, PageLayout } from "@/components/common";
import { Container } from "@/components/ui";
import { cartToView, getCurrentCart } from "@/backend/services/cart.service";
export const metadata: Metadata = { title: "سبد خرید | La Femme", description: "سبد خرید فروشگاه La Femme", alternates: { canonical: "/cart" } };
export const dynamic = "force-dynamic";
export default async function CartPage() {
  const items = cartToView(await getCurrentCart()); const total = items.reduce((s,i)=>s+i.price*i.quantity,0); const itemCount=items.reduce((s,i)=>s+i.quantity,0);
  return <PageLayout><PageHero title="سبد خرید" description="محصولات انتخابی شما" /><section className="py-16"><Container><div className="cart-layout"><div className="cart-items-section"><CartList items={items} /></div><div className="cart-summary-section"><CartSummary total={total} itemCount={itemCount} /></div></div></Container></section></PageLayout>;
}
