import type { Metadata } from "next";
import { requireSession } from "@/backend/auth/session";
import { getPrisma } from "@/backend/database/prisma";
import { getStorefrontProducts } from "@/backend/services/storefront-product.service";
import { AccountLayout } from "@/components/account/AccountLayout";
import { PageLayout } from "@/components/common";
import { ProductCard } from "@/components/products";
import { Card } from "@/components/ui";

export const metadata: Metadata = {
  title: "علاقه‌مندی‌ها | La Femme",
  robots: { index: false, follow: false },
};

/** صفحه محصولات مورد علاقه کاربر — فقط برای کاربران لاگین‌شده. */
export default async function WishlistPage() {
  // این بخش سطح دسترسی کاربر را بررسی می‌کند
  const session = await requireSession();

  // دریافت آیدی محصولات مورد علاقه از دیتابیس
  const wishlist = await getPrisma().wishlist.findUnique({
    where: { userId: session.userId },
    select: {
      items: { select: { productId: true }, orderBy: { createdAt: "desc" } },
    },
  });

  const wishlistProductIds = new Set((wishlist?.items ?? []).map((item) => item.productId));

  // دریافت محصولات کامل از سرویس (با قیمت‌های لحظه‌ای)
  const allProducts = await getStorefrontProducts();
  const wishlistProducts = allProducts.filter((p) => wishlistProductIds.has(p.id));

  return (
    <PageLayout>
      <AccountLayout>
        <Card className="dashboard-card p-6">
          <h1>علاقه‌مندی‌ها</h1>
          {wishlistProducts.length === 0 ? (
            <div className="empty-cart" style={{ padding: "40px 0" }}>
              <div className="empty-cart-icon">🤍</div>
              <h2>لیست علاقه‌مندی‌ها خالی است</h2>
              <p>محصولاتی که دوست دارید را به اینجا اضافه کنید.</p>
            </div>
          ) : (
            <div className="products-grid mt-6">
              {wishlistProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </Card>
      </AccountLayout>
    </PageLayout>
  );
}
