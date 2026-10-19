import type { Metadata } from "next";
import Link from "next/link";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { ProductsCatalog } from "@/components/products";
import { getStorefrontProducts } from "@/backend/services/storefront-product.service";
import { StructuredData } from "@/components/seo/StructuredData";
import { breadcrumbSchema } from "@/lib/seo";

export const metadata: Metadata = {
  title: "قیمت و خرید شمش طلا و نقره",
  description: "مشاهده و مقایسه شمش‌های طلا و نقره با قیمت لحظه‌ای بازار، گواهی اصالت و ارسال امن.",
  keywords: ["شمش طلا", "شمش نقره", "قیمت لحظه‌ای طلا", "La Femme"],
  alternates: { canonical: "/products" },
  openGraph: { title: "محصولات La Femme", description: "شمش‌های طلا و نقره با قیمت لحظه‌ای بازار", url: "/products", type: "website" },
};

// force-dynamic عمداً است، نه ISR: این پروژه در Docker ساخته می‌شود بدون دسترسی به
// دیتابیس در زمان build (migration/seed فقط هنگام اجرای کانتینر انجام می‌شود). اگر این
// صفحه ISR شود، Next.js آن را در همان مرحله build از پیش رندر می‌کند، جایی که دیتابیس
// در دسترس نیست — و fallback محصولات نمونه (id های "1".."6") برای کل بازه revalidate
// در ایمیج ذخیره می‌شود. یک بار این باگ واقعاً رخ داد؛ به force-dynamic برنگردید.
export const dynamic = "force-dynamic";

export default async function ProductsPage() {
  const products = await getStorefrontProducts();
  return (
    <>
      <SiteHeader />
      <main dir="rtl">
        <StructuredData data={breadcrumbSchema([{ name: "خانه", path: "/" }, { name: "محصولات", path: "/products" }])} />
        <section className="page-hero"><div className="container"><span className="hero-badge">مجموعه شمش‌های لوکس</span><h1>محصولات La Femme</h1><p>شمش‌های طلا و نقره با قیمت محاسبه‌شده از بازار، اصالت قابل رهگیری و بسته‌بندی امن.</p></div></section>
        <section className="breadcrumb-section" aria-label="مسیر صفحه"><div className="container"><nav className="breadcrumb"><Link href="/">خانه</Link><span aria-hidden="true">/</span><span aria-current="page">محصولات</span></nav></div></section>
        <ProductsCatalog items={products} />
      </main>
      <SiteFooter />
    </>
  );
}
