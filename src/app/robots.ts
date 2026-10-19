import type { MetadataRoute } from "next";
import { absoluteUrl, getSiteUrl, isPublicSite } from "@/lib/seo";

export const dynamic = "force-dynamic";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: isPublicSite()
      ? [{ userAgent: "*", allow: "/", disallow: ["/admin", "/dashboard", "/checkout", "/orders", "/api/"] }]
      : [{ userAgent: "*", disallow: "/" }],
    sitemap: absoluteUrl("/sitemap.xml"),
    host: getSiteUrl(),
  };
}
