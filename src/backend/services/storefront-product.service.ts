import "server-only";
import type { Product } from "@/types/product";
import { products as fallbackProducts } from "@/data/products";
import { calculateProductPrice, getMarketQuotes } from "./market-price.service";

function purityFactor(purity: string | null | undefined): number {
  const text = purity ?? "";
  if (text.includes("۱۸" ) || text.includes("18")) return 0.75;
  if (text.includes("۹۹۹") || text.includes("999") || text.includes("۲۴") || text.includes("24")) return 0.999;
  return 1;
}

function applyLivePrices(items: Product[], gold: number, silver: number): Product[] {
  return items.map((item) => ({
    ...item,
    price: calculateProductPrice({
      weightInGrams: item.weightValue,
      marketPricePerGram: item.type === "gold" ? gold : silver,
      purityFactor: purityFactor(item.purity),
      premiumPercent: item.premiumPercent ?? 0,
      fixedPremium: item.fixedPremium ?? 0,
      fallbackPrice: item.price,
    }),
    marketPricePerGram: item.type === "gold" ? gold : silver,
    isLivePrice: (item.type === "gold" ? gold : silver) > 0,
  }));
}

async function loadDbProducts(): Promise<Product[] | null> {
  if (!process.env.DATABASE_URL) return null;
  try {
    const { productRepository } = await import("@/backend/database/repositories/product.repository");
    const rows = await productRepository.findAllActive();
    return rows.map((row) => {
      const extendedRow = row as typeof row & { premiumPercent?: unknown; fixedPremium?: unknown };
      const primary = row.images.find((image) => image.isPrimary) ?? row.images[0];
      const inventory = row.inventory?.quantity ?? row.stock;
      return {
        id: row.id,
        name: row.name,
        slug: row.slug,
        description: row.description ?? row.shortDescription ?? "",
        price: Number(row.price),
        imageSrc: primary?.url ?? row.image ?? "/assets/images/hero-gold-bar.png",
        category: row.category.name,
        href: `/products/${row.id}`,
        stock: Math.max(0, inventory - (row.inventory?.reserved ?? 0)),
        type: row.metalType === "SILVER" ? "silver" : "gold",
        weight: row.weight ?? `${row.weightValue ?? 0} گرم`,
        weightValue: row.weightValue ?? 0,
        purity: row.purity ?? "",
        specifications: [row.purity, row.weight, row.certificate].filter(Boolean) as string[],
        isFeatured: row.isFeatured,
        certificate: row.certificate ?? undefined,
        brand: row.brand,
        premiumPercent: Number(extendedRow.premiumPercent ?? 0),
        fixedPremium: Number(extendedRow.fixedPremium ?? 0),
      } satisfies Product;
    });
  } catch (err) {
    // خطای واقعی دیتابیس را لاگ می‌کنیم — قبلاً این catch کاملاً بی‌صدا بود و یک قطعی
    // موقت را با محصولات نمونه (id های "1".."6") جایگزین می‌کرد که وقتی این صفحه ISR
    // است، می‌تواند تا پایان بازه revalidate روی سایت واقعی بماند.
    console.error("[storefront-product.service] loadDbProducts failed, falling back to mock catalog:", err);
    return null;
  }
}

export async function getStorefrontProducts(): Promise<Product[]> {
  const [dbProducts, quotes] = await Promise.all([loadDbProducts(), getMarketQuotes()]);
  return applyLivePrices(dbProducts?.length ? dbProducts : fallbackProducts, quotes.gold.price, quotes.silver.price);
}

export async function getStorefrontProduct(idOrSlug: string): Promise<Product | undefined> {
  const items = await getStorefrontProducts();
  return items.find((item) => item.id === idOrSlug || item.slug === idOrSlug);
}

export async function getFeaturedStorefrontProducts(limit = 6): Promise<Product[]> {
  const items = await getStorefrontProducts();
  return items.filter((item) => item.isFeatured).slice(0, limit);
}
