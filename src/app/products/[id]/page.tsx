import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { InvestmentCalculator, ProductGallery, ProductInfo, ProductPrice, ProductSpecifications } from "@/components/products";
import { Container } from "@/components/ui";
import { getStorefrontProduct } from "@/backend/services/storefront-product.service";
import { addToCartAction } from "@/app/actions/cart";
import { StructuredData } from "@/components/seo/StructuredData";
import { breadcrumbSchema, productSchema } from "@/lib/seo";
import { ProductBuyingGuide } from "@/components/products/ProductBuyingGuide";

interface PageProps { params: Promise<{ id: string }>; }
// force-dynamic عمداً است، نه ISR — نگاه کنید به توضیح مشابه در src/app/products/page.tsx:
// این پروژه در Docker بدون دسترسی به دیتابیس در زمان build ساخته می‌شود، و ISR باعث
// می‌شود Next.js این صفحه را در همان مرحله build از پیش رندر کند و fallback محصولات
// نمونه را برای کل بازه revalidate در ایمیج ذخیره کند. یک بار این باگ واقعاً رخ داد.
export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const product = await getStorefrontProduct(id);
  if (!product) notFound();
  return {
    title: product.name,
    description: product.description,
    alternates: { canonical: `/products/${product.id}` },
    openGraph: { title: product.name, description: product.description, url: `/products/${product.id}`, type: "website", images: [{ url: product.imageSrc, alt: product.name }] },
    twitter: { card: "summary_large_image", title: product.name, description: product.description, images: [product.imageSrc] },
    ...(product.isLivePrice && Number.isFinite(product.price) && product.price > 0 ? { other: { "product:price:amount": String(product.price * 10), "product:price:currency": "IRR" } } : {}),
  };
}

export default async function ProductDetailPage({ params }: PageProps) {
  const { id } = await params;
  const product = await getStorefrontProduct(id);
  if (!product) notFound();
  return (
    <>
      <SiteHeader />
      <main dir="rtl">
        <StructuredData data={productSchema(product)} />
        <StructuredData data={breadcrumbSchema([{ name: "خانه", path: "/" }, { name: "محصولات", path: "/products" }, { name: product.name, path: `/products/${product.id}` }])} />
        <section className="breadcrumb-section" aria-label="مسیر صفحه"><Container><nav className="breadcrumb"><Link href="/">خانه</Link><span>/</span><Link href="/products">محصولات</Link><span>/</span><span aria-current="page">{product.name}</span></nav></Container></section>
        <section className="product-detail" id="product-purchase"><Container><div className="product-detail-wrapper"><ProductGallery product={product} /><div className="product-detail-info"><ProductInfo product={product} /><ProductPrice value={product.price} />
          <div className="live-price-note" role="status">{product.isLivePrice ? `قیمت بر پایه نرخ لحظه‌ای هر گرم ${product.type === "gold" ? "طلا" : "نقره"} محاسبه شده است.` : "قیمت موقت فروشگاه نمایش داده می‌شود؛ نرخ بازار در دسترس نیست."}</div>
          <ProductSpecifications product={product} /><div className="product-actions"><form action={addToCartAction}><input type="hidden" name="productId" value={product.id} /><button type="submit" className="btn btn-primary" disabled={product.stock <= 0}>افزودن به سبد خرید</button></form><Link href="/cart" className="btn btn-secondary">مشاهده سبد خرید</Link></div><p className="product-stock">{product.stock > 0 ? `موجودی: ${product.stock.toLocaleString("fa-IR")} عدد` : "ناموجود"}</p></div></div></Container></section>
        <ProductBuyingGuide product={product} />
        <section className="product-investment-section"><Container><InvestmentCalculator productPrice={product.price} productWeight={product.weightValue} metalLabel={product.type === "gold" ? "طلا" : "نقره"} /></Container></section>
      </main>
      <SiteFooter />
    </>
  );
}
