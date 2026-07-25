import type { Product } from "@/types/product";
import { ProductCard } from "./ProductCard";

/** شبکه واکنش‌گرای محصولات با همان کلاس نسخه اصلی. */
export function ProductGrid({ items }: { items: Product[] }) {
  return (
    <div className="products-grid" id="products-container">
      {items.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}
