import type { Product } from "@/types/product";

/**
 * محصولات فروشگاه از دیتابیس Prisma دریافت می‌شوند.
 * این آرایه عمداً خالی است تا محصول پیش‌فرض یا آزمایشی نمایش داده نشود.
 */
export const products: Product[] = [];

/**
 * یافتن محصول بر اساس شناسه.
 * @param id شناسه محصول
 */
export function getProductById(id: string): Product | undefined {
  return products.find((product) => product.id === id);
}

/**
 * یافتن محصول بر اساس slug.
 * @param slug شناسه قابل‌خواندن محصول در URL
 */
export function getProductBySlug(slug: string): Product | undefined {
  return products.find((product) => product.slug === slug);
}

/** لیست محصولات منتخب. */
export const featuredProductList: Product[] = products.filter(
  (product) => product.isFeatured,
);