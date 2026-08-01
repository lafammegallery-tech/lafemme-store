import Image from "next/image";
import type { Product } from "@/types/product";
import { ProductImageGallery } from "./ProductImageGallery";

/** گالری محصول — چند تصویر اگر موجود باشد، در غیر این صورت تصویر اصلی. */
export function ProductGallery({ product }: { product: Product }) {
  if (product.images && product.images.length > 0) {
    return <ProductImageGallery images={product.images} productName={product.name} />;
  }

  return (
    <figure className="product-gallery">
      <Image
        src={product.imageSrc}
        alt={product.name}
        width={600}
        height={600}
        sizes="(max-width: 1024px) 100vw, 50vw"
        className="product-gallery-image"
        priority
      />
    </figure>
  );
}
