import type { Metadata } from "next";
import Link from "next/link";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { ProductsCatalog } from "@/components/products";
import { getStorefrontProducts } from "@/backend/services/storefront-product.service";

export const metadata: Metadata = {
  title: "خرید شمش طلا و نقره | La Femme",
  description: "مشاهده و مقایسه شمش‌های طلا و نقره با قیمت لحظه‌ای بازار، گواهی اصالت و ارسال امن.",
  keywords: ["شمش طلا", "شمش نقره", "قیمت لحظه‌ای طلا", "La Femme"],
  alternates: { canonical: "/products" },
  openGraph: { title: "محصولات La Femme", description: "شمش‌های طلا و نقره با قیمت لحظه‌ای بازار", url: "/products", type: "website" },
};

export const dynamic = "force-dynamic";

export default async function ProductsPage() {
  const products = await getStorefrontProducts();
  return (
    <>
      <SiteHeader />
      <main dir="rtl">
        <section className="page-hero"><div className="container"><span className="hero-badge">مجموعه شمش‌های لوکس</span><h1>محصولات La Femme</h1><p>شمش‌های طلا و نقره با قیمت محاسبه‌شده از بازار، اصالت قابل رهگیری و بسته‌بندی امن.</p></div></section>
        <section className="breadcrumb-section" aria-label="مسیر صفحه"><div className="container"><nav className="breadcrumb"><Link href="/">خانه</Link><span aria-hidden="true">/</span><span aria-current="page">محصولات</span></nav></div></section>
        <ProductsCatalog items={products} />
      </main>
      <SiteFooter />
    </>
  );
}
