import type { Product } from "@/types/product";

// مشخصات محصول
export function ProductSpecifications({ product }: { product: Product }) {
  return (
    <ul>
      {product.specifications.map((spec: string) => (
        <li key={spec}>{spec}</li>
      ))}
    </ul>
  );
}
