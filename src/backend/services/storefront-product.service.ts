import "server-only";
import type { Product } from "@/types/product";
import { products as fallbackProducts } from "@/data/products";
import { calculateProductPrice, getMarketQuotes } from "./market-price.service";

// استفاده از طلای ۹۹۵ به عنوان مبنای محاسبه قیمت
function purityFactor(purity: string | null | undefined): number {
  const text = purity ?? "";
  if (text.includes("۷۵۰") || text.includes("750") || text.includes("۱۸") || text.includes("18")) return 750 / 995;
  if (text.includes("۹۹۵") || text.includes("995")) return 1.0;
  if (text.includes("۹۹۹") || text.includes("999") || text.includes("۲۴") || text.includes("24")) return 999 / 995;
  return 1.0;
}

function applyLivePrices(items: Product[], gold995: number, silver: number): Product[] {
  return items.map((item) => ({
    ...item,
    price: calculateProductPrice({
      weightInGrams: item.weightValue,
      marketPricePerGram: item.type === "gold" ? gold995 : silver,
      purityFactor: purityFactor(item.purity),
      premiumPercent: item.premiumPercent ?? 0,
      fixedPremium: item.fixedPremium ?? 0,
      fallbackPrice: item.price,
    }),
    marketPricePerGram: item.type === "gold" ? gold995 : silver,
    isLivePrice: (item.type === "gold" ? gold995 : silver) > 0,
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
        images: row.images.map((img) => ({
          id: img.id,
          url: img.url,
          altText: img.altText,
          isPrimary: img.isPrimary,
          sortOrder: img.sortOrder,
        })),
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
    console.error("[storefront-product.service] loadDbProducts failed, falling back to mock catalog:", err);
    return null;
  }
}

export async function getStorefrontProducts(): Promise<Product[]> {
  const [dbProducts, quotes] = await Promise.all([loadDbProducts(), getMarketQuotes()]);
  return applyLivePrices(
    dbProducts?.length ? dbProducts : fallbackProducts,
    quotes.gold995.price,
    quotes.silver999.price,
  );
}

export async function getStorefrontProduct(idOrSlug: string): Promise<Product | undefined> {
  const items = await getStorefrontProducts();
  return items.find((item) => item.id === idOrSlug || item.slug === idOrSlug);
}

export async function getFeaturedStorefrontProducts(limit = 6): Promise<Product[]> {
  const items = await getStorefrontProducts();
  return items.filter((item) => item.isFeatured).slice(0, limit);
}
