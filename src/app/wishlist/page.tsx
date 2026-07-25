import type { Metadata } from "next";
import { AccountLayout } from "@/components/account/AccountLayout";
import { PageLayout } from "@/components/common";
import { ProductCard } from "@/components/products";
import { Card } from "@/components/ui";
import { products } from "@/data/products";
export const metadata: Metadata = {
  title: "علاقه‌مندی‌ها | La Femme",
  robots: { index: false, follow: false },
};
/** فهرست آزمایشی محصولات مورد علاقه. */
export default function WishlistPage() {
  return (
    <PageLayout>
      <AccountLayout>
        <Card className="dashboard-card p-6">
          <h1>علاقه‌مندی‌ها</h1>
          <div className="products-grid mt-6">
            {products.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </Card>
      </AccountLayout>
    </PageLayout>
  );
}
