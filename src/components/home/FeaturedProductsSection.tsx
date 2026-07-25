import Image from "next/image";
import { ButtonLink, Container } from "@/components/ui";
import { getFeaturedStorefrontProducts } from "@/backend/services/storefront-product.service";

export async function FeaturedProductsSection() {
  const featuredProducts = await getFeaturedStorefrontProducts(6);
  return (
    <section className="featured-products" aria-labelledby="featured-products-title"><Container><div className="section-title"><span>La Femme Collection</span><h2 id="featured-products-title">مجموعه منتخب</h2><p>شمش‌های منتخب طلا و نقره با قیمت لحظه‌ای و گواهی اصالت</p></div><div className="products-grid">
      {featuredProducts.map((product) => <article className="product-card" key={product.id}><div className="product-image"><Image alt={product.name} src={product.imageSrc} width={500} height={500} sizes="(max-width: 768px) 100vw, 33vw" /></div><div className="product-content"><h3>{product.name}</h3><span className="product-weight">{product.weight}</span><div className="product-price">{product.price.toLocaleString("fa-IR")} تومان</div><span className="price-source-badge">{product.isLivePrice ? "قیمت لحظه‌ای" : "قیمت پشتیبان"}</span><ButtonLink href={product.href}>مشاهده محصول</ButtonLink></div></article>)}
    </div></Container></section>
  );
}
