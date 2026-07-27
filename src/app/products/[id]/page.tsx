import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { InvestmentCalculator, ProductGallery, ProductInfo, ProductPrice, ProductSpecifications } from "@/components/products";
import { Container } from "@/components/ui";
import { getStorefrontProduct } from "@/backend/services/storefront-product.service";
import { addToCartAction } from "@/app/actions/cart";

interface PageProps { params: Promise<{ id: string }>; }
// force-dynamic عمداً است، نه ISR — نگاه کنید به توضیح مشابه در src/app/products/page.tsx:
// این پروژه در Docker بدون دسترسی به دیتابیس در زمان build ساخته می‌شود، و ISR باعث
// می‌شود Next.js این صفحه را در همان مرحله build از پیش رندر کند و fallback محصولات
// نمونه را برای کل بازه revalidate در ایمیج ذخیره کند. یک بار این باگ واقعاً رخ داد.
export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const product = await getStorefrontProduct(id);
  if (!product) return { title: "محصول یافت نشد" };
  return {
    title: `${product.name} | La Femme`,
    description: product.description,
    alternates: { canonical: `/products/${product.id}` },
    openGraph: { title: product.name, description: product.description, url: `/products/${product.id}`, type: "website", images: [{ url: product.imageSrc, alt: product.name }] },
    other: { "product:price:amount": String(product.price), "product:price:currency": "IRR" },
  };
}

export default async function ProductDetailPage({ params }: PageProps) {
  const { id } = await params;
  const product = await getStorefrontProduct(id);
  if (!product) notFound();
  const productJsonLd = {
    "@context": "https://schema.org", "@type": "Product", name: product.name, image: [product.imageSrc], description: product.description,
    sku: product.slug, brand: { "@type": "Brand", name: product.brand ?? "La Femme" },
    offers: { "@type": "Offer", priceCurrency: "IRR", price: product.price, availability: product.stock > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock", url: `/products/${product.id}` },
  };
  return (
    <>
      <SiteHeader />
      <main dir="rtl">
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(productJsonLd).replace(/</g, "\u003c") }} />
        <section className="breadcrumb-section" aria-label="مسیر صفحه"><Container><nav className="breadcrumb"><Link href="/">خانه</Link><span>/</span><Link href="/products">محصولات</Link><span>/</span><span aria-current="page">{product.name}</span></nav></Container></section>
        <section className="product-detail"><Container><div className="product-detail-wrapper"><ProductGallery product={product} /><div className="product-detail-info"><ProductInfo product={product} /><ProductPrice value={product.price} />
          <div className="live-price-note" role="status">{product.isLivePrice ? `قیمت بر پایه نرخ لحظه‌ای هر گرم ${product.type === "gold" ? "طلا" : "نقره"} محاسبه شده است.` : "قیمت موقت فروشگاه نمایش داده می‌شود؛ نرخ بازار در دسترس نیست."}</div>
          <ProductSpecifications product={product} /><div className="product-actions"><form action={addToCartAction}><input type="hidden" name="productId" value={product.id} /><button type="submit" className="btn btn-primary" disabled={product.stock <= 0}>افزودن به سبد خرید</button></form><Link href="/cart" className="btn btn-secondary">مشاهده سبد خرید</Link></div><p className="product-stock">{product.stock > 0 ? `موجودی: ${product.stock.toLocaleString("fa-IR")} عدد` : "ناموجود"}</p></div></div></Container></section>
        <section className="product-investment-section"><Container><InvestmentCalculator productPrice={product.price} productWeight={product.weightValue} metalLabel={product.type === "gold" ? "طلا" : "نقره"} /></Container></section>
      </main>
      <SiteFooter />
    </>
  );
}
