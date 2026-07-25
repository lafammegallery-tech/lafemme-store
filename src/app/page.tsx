import type { Metadata } from "next";
import { FeaturedProductsSection, HeroSection, WhyUsSection } from "@/components/home";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { MarketOverview } from "@/components/market/MarketOverview";

export const metadata: Metadata = {
  title: "شمش طلا و نقره",
  description: "فروش شمش طلا و نقره برند La Femme با طراحی لوکس و کیفیت ممتاز.",
  alternates: { canonical: "/" },
  openGraph: {
    title: "La Femme | شمش طلا و نقره",
    description: "مجموعه منتخب شمش‌های طلا و نقره La Femme.",
    url: "/",
    type: "website",
    images: [
      {
        url: "/assets/images/hero-gold-bar.png",
        alt: "شمش طلای La Femme",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "La Femme | شمش طلا و نقره",
    description: "مجموعه منتخب شمش‌های طلا و نقره La Femme.",
    images: ["/assets/images/hero-gold-bar.png"],
  },
};

/**
 * Home page migrated from legacy HTML to typed React components.
 * The existing CSS classes and visual hierarchy are intentionally preserved.
 */
export default function HomePage() {
  return (
    <>
      {/* ===================================================== */}
      {/* HEADER */}
      {/*
       * این بخش در بالاترین قسمت سایت قرار می‌گیرد.
       * از Header معنایی برای SEO و Screen Reader استفاده شده است.
       */}
      <SiteHeader />

      {/*
       * تگ Main محتوای اصلی صفحه را در بر می‌گیرد.
       * تمام Sectionهای صفحه اصلی داخل Main قرار دارند.
       */}
      <main>
        {/* HERO SECTION — معرفی سریع برند و هدایت به محصولات */}
        <HeroSection />

        <MarketOverview />

        {/* FEATURED PRODUCTS — ویترین محصولات منتخب */}
        <FeaturedProductsSection />

        {/* WHY CHOOSE US — مزیت‌های برند La Femme */}
        <WhyUsSection />
      </main>

      {/* FOOTER — اطلاعات و دسترسی‌های مشترک سایت */}
      <SiteFooter />
    </>
  );
}
