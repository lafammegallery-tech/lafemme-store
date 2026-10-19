import type { MetadataRoute } from "next";
import { getStorefrontProducts } from "@/backend/services/storefront-product.service";
import { absoluteUrl } from "@/lib/seo";
import { buyingGuides } from "@/data/buying-guides";
export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticRoutes = ["", "/products", "/about", "/contact", "/faq", "/privacy", "/terms", "/guides", ...buyingGuides.map((guide) => `/guides/${guide.slug}`)];
  let products: Awaited<ReturnType<typeof getStorefrontProducts>> = [];
  try { products = await getStorefrontProducts(); } catch { products = []; }
  return [
    ...staticRoutes.map((route, index) => ({ url: absoluteUrl(route || "/"), changeFrequency: index < 2 ? "daily" as const : "monthly" as const, priority: index === 0 ? 1 : index === 1 ? .9 : .6 })),
    ...products.map((product) => ({ url: absoluteUrl(`/products/${product.id}`), ...(product.updatedAt ? { lastModified: new Date(product.updatedAt) } : {}), changeFrequency: "daily" as const, priority: .8 })),
  ];
}
