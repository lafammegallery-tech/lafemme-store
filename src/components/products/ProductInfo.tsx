import type { Product } from "@/types/product";

/** اطلاعات اصلی محصول شامل نام، توضیحات و مشخصات کلیدی. */
export function ProductInfo({ product }: { product: Product }) {
  return (
    <section className="product-info">
      <h1>{product.name}</h1>
      <p className="product-description">{product.description}</p>
      <div className="product-meta">
        <span className="product-weight">{product.weight}</span>
        <span className="product-purity">{product.purity}</span>
        <span className="product-category">دسته: {product.category}</span>
      </div>
    </section>
  );
}
