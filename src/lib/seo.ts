import type { Product } from "@/types/product";

export function getSiteUrl(): string {
  const url = new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000");
  return url.origin;
}

export function absoluteUrl(pathOrUrl: string): string {
  return new URL(pathOrUrl, `${getSiteUrl()}/`).toString();
}

export function isPublicSite(): boolean {
  return getSiteUrl() === "https://lafemmebar.com";
}

export function safeJsonLd(value: unknown): string {
  return JSON.stringify(value).replace(/</g, "\\u003c");
}

export function breadcrumbSchema(items: Array<{ name: string; path: string }>) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem", position: index + 1, name: item.name, item: absoluteUrl(item.path),
    })),
  };
}

export function productSchema(product: Product) {
  const url = absoluteUrl(`/products/${product.id}`);
  const validPrice = product.isLivePrice && Number.isFinite(product.price) && product.price > 0;
  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    image: [...new Set([product.imageSrc, ...(product.images ?? []).map((image) => image.url)])].map(absoluteUrl),
    description: product.description,
    sku: product.slug,
    category: product.category,
    brand: { "@type": "Brand", name: product.brand ?? "La Femme" },
    url,
    ...(validPrice ? {
      offers: {
        "@type": "Offer",
        priceCurrency: "IRR",
        price: product.price * 10,
        availability: product.stock > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
        url,
        seller: { "@id": `${absoluteUrl("/")}#organization` },
      },
    } : {}),
  };
}
