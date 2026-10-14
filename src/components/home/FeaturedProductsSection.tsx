import { Container } from "@/components/ui";
import { ProductCard } from "@/components/products/ProductCard";
import { getFeaturedStorefrontProducts } from "@/backend/services/storefront-product.service";

export async function FeaturedProductsSection() {
  const featuredProducts = await getFeaturedStorefrontProducts(6);
  return (
    <section className="featured-products" aria-labelledby="featured-products-title">
      <Container>
        <div className="section-title">
          <span>La Femme Collection</span>
          <h2 id="featured-products-title">مجموعه منتخب</h2>
          <p>شمش‌های منتخب طلا و نقره با قیمت لحظه‌ای و گواهی اصالت</p>
        </div>
        <div className="products-grid">
          {featuredProducts.map((product) => <ProductCard key={product.id} product={product} />)}
        </div>
      </Container>
    </section>
  );
}
