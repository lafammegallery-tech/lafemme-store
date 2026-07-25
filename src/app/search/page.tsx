import type { Metadata } from "next";
import { PageHero, PageLayout } from "@/components/common";
import { SearchExperience } from "@/components/search/SearchExperience";
export const metadata: Metadata = {
  title: "جست‌وجو | La Femme",
  description: "جست‌وجو و فیلتر محصولات La Femme",
  robots: { index: false, follow: true },
};
/** صفحه جست‌وجوی کاملاً فرانت‌اند با داده Mock. */
export default function SearchPage() {
  return (
    <PageLayout>
      <PageHero title="جست‌وجوی محصولات" />
      <SearchExperience />
    </PageLayout>
  );
}
