import Image from "next/image";
import Link from "next/link";
import type { Product } from "@/types/product";

/**
 * کارت مشترک محصول.
 * ساختار کلاس‌ها عمداً مطابق نسخه HTML قدیمی نگه داشته شده است
 * تا CSS فعلی بدون تغییر ظاهری روی آن اعمال شود.
 */
export function ProductCard({ product }: { product: Product }) {
  return (
    <article className="product-card">
      <Link href={`/products/${product.id}`} className="product-image" aria-label={`مشاهده ${product.name}`}>
        {product.badge ? <span className="product-badge">{product.badge}</span> : null}

        <Image
          src={product.imageSrc}
          alt={product.name}
          fill
          sizes="(max-width: 700px) 100vw, (max-width: 1100px) 50vw, 33vw"
          className="product-card-image"
        />
      </Link>

      <div className="product-content">
        <h3>{product.name}</h3>
        <span className="product-weight">{product.weight}</span>
        <p className="product-purity">{product.purity}</p>

        <div className="product-price" aria-label={`قیمت ${product.name}`}>
          {new Intl.NumberFormat("fa-IR").format(product.price)} تومان
        </div>
        <span className="price-source-badge">{product.isLivePrice ? "قیمت به‌روز" : "قیمت موقت · خرید متوقف"}</span>

        <Link href={`/products/${product.id}`} className="btn btn-primary">
          مشاهده محصول
        </Link>
      </div>
    </article>
  );
}
