import type { Metadata } from "next";
import { FeaturedProductsSection, HeroSection, WhyUsSection } from "@/components/home";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { MarketOverview } from "@/components/market/MarketOverview";
import { InvestmentCalculator } from "@/components/home/InvestmentCalculator";
import { brandHomeTitle, brandDescription } from "@/lib/brand";
import { BuyingGuidesSection } from "@/components/home/BuyingGuidesSection";
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: { absolute: brandHomeTitle },
  description: brandDescription,
  alternates: { canonical: "/" },
  openGraph: {
    title: brandHomeTitle,
    description: brandDescription,
    url: "/",
    type: "website",
    images: [
      {
        url: "/assets/images/hero-gold-bar.webp",
        alt: "شمش طلای لفم (La Femme)",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: brandHomeTitle,
    description: brandDescription,
    images: ["/assets/images/hero-gold-bar.webp"],
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

        <InvestmentCalculator />

        {/* FEATURED PRODUCTS — ویترین محصولات منتخب */}
        <FeaturedProductsSection />

        <BuyingGuidesSection />

        {/* WHY CHOOSE US — مزیت‌های برند La Femme */}
        <WhyUsSection />
      </main>

      {/* FOOTER — اطلاعات و دسترسی‌های مشترک سایت */}
      <SiteFooter />
    </>
  );
}
