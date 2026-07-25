import Image from "next/image";
import type { Product } from "@/types/product";

/** گالری اصلی محصول با تصویر واکنش‌گرا و Lazy Loading. */
export function ProductGallery({ product }: { product: Product }) {
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
