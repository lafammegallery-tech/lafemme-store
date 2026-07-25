import type { MetadataRoute } from "next";
import { getStorefrontProducts } from "@/backend/services/storefront-product.service";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  const staticRoutes = ["", "/products", "/about", "/contact", "/faq", "/privacy", "/terms"];
  let products: Awaited<ReturnType<typeof getStorefrontProducts>> = [];
  try { products = await getStorefrontProducts(); } catch { products = []; }
  return [
    ...staticRoutes.map((route, index) => ({ url: `${baseUrl}${route}`, lastModified: new Date(), changeFrequency: index < 2 ? "daily" as const : "monthly" as const, priority: index === 0 ? 1 : index === 1 ? .9 : .6 })),
    ...products.map((product) => ({ url: `${baseUrl}/products/${product.id}`, lastModified: new Date(), changeFrequency: "daily" as const, priority: .8 })),
  ];
}
