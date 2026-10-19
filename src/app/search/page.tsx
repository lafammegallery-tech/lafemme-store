import type { Metadata } from "next";
import { PageHero, PageLayout } from "@/components/common";
import { SearchExperience } from "@/components/search/SearchExperience";
import { getStorefrontProducts } from "@/backend/services/storefront-product.service";
export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "جست‌وجو",
  description: "جست‌وجو و فیلتر محصولات La Femme",
  robots: { index: false, follow: true },
};
/** صفحه جست‌وجوی کاملاً فرانت‌اند با داده Mock. */
export default async function SearchPage() {
  const products = await getStorefrontProducts();
  return (
    <PageLayout>
      <PageHero title="جست‌وجوی محصولات" />
      <SearchExperience products={products} />
    </PageLayout>
  );
}
