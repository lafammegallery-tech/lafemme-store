import { test } from "node:test";
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { absoluteUrl, getSiteUrl, isPublicSite, safeJsonLd, breadcrumbSchema, productSchema } from "../src/lib/seo";
import robots from "../src/app/robots";
import type { Product } from "../src/types/product";

const product: Product = {
  id: "gold-10", slug: "gold-10g", name: "شمش طلا ۱۰ گرمی", description: "مشخصات شمش طلا",
  imageSrc: "/uploads/products/gold.webp", category: "طلا", href: "/products/gold-10",
  price: 123456, stock: 2, type: "gold", weight: "۱۰ گرم", weightValue: 10,
  purity: "995", specifications: [], isLivePrice: true,
};

test("SEO URLs and robots follow runtime domain, not Docker build defaults", () => {
  const previous = process.env.NEXT_PUBLIC_SITE_URL;
  try {
    process.env.NEXT_PUBLIC_SITE_URL = "https://lafemmebar.com/";
    assert.equal(getSiteUrl(), "https://lafemmebar.com");
    assert.equal(isPublicSite(), true);
    assert.equal(absoluteUrl("/products/gold-10"), "https://lafemmebar.com/products/gold-10");
    assert.equal(robots().sitemap, "https://lafemmebar.com/sitemap.xml");
    assert.deepEqual(robots().rules, [{ userAgent: "*", allow: "/", disallow: ["/admin", "/dashboard", "/checkout", "/orders", "/api/"] }]);
    process.env.NEXT_PUBLIC_SITE_URL = "http://localhost:8091";
    assert.equal(isPublicSite(), false);
    assert.deepEqual(robots().rules, [{ userAgent: "*", disallow: "/" }]);
    assert.equal(robots().sitemap, "http://localhost:8091/sitemap.xml");
    delete process.env.NEXT_PUBLIC_SITE_URL;
    assert.equal(getSiteUrl(), "http://localhost:3000");
    assert.equal(isPublicSite(), false);
  } finally {
    if (previous === undefined) delete process.env.NEXT_PUBLIC_SITE_URL;
    else process.env.NEXT_PUBLIC_SITE_URL = previous;
  }
});

test("JSON-LD escapes script terminators without changing stored content", () => {
  const data = { name: '</script><script>alert("x")</script>', description: "شمش & طلا" };
  const json = safeJsonLd(data);
  assert.ok(!json.includes("<"));
  assert.deepEqual(JSON.parse(json), data);
});

test("product schema uses absolute URLs, real stock and one toman-to-rial conversion", () => {
  const schema = productSchema(product);
  assert.equal(schema.url, absoluteUrl(product.href));
  assert.equal(schema.offers?.priceCurrency, "IRR");
  assert.equal(schema.offers?.price, product.price * 10);
  assert.equal(schema.offers?.availability, "https://schema.org/InStock");
  assert.equal(schema.offers?.url, schema.url);
  assert.deepEqual(schema.image, [absoluteUrl(product.imageSrc)]);
  assert.equal(productSchema({ ...product, stock: 0 }).offers?.availability, "https://schema.org/OutOfStock");
  for (const change of [{ isLivePrice: false }, { price: 0 }, { price: -1 }, { price: NaN }, { price: Infinity }]) {
    assert.ok(!("offers" in productSchema({ ...product, ...change })));
  }
  assert.ok(!("aggregateRating" in schema));
  assert.ok(!("review" in schema));
});

test("breadcrumb schema has ordered absolute links", () => {
  const schema = breadcrumbSchema([{ name: "خانه", path: "/" }, { name: "محصولات", path: "/products" }]);
  assert.equal(schema["@type"], "BreadcrumbList");
  assert.deepEqual(schema.itemListElement.map((item) => item.position), [1, 2]);
  assert.deepEqual(schema.itemListElement.map((item) => item.item), [absoluteUrl("/"), absoluteUrl("/products")]);
});

test("runtime metadata, private noindex and image cache boundaries remain explicit", () => {
  const source = (path: string) => readFileSync(new URL(`../${path}`, import.meta.url), "utf8");
  assert.match(source("src/app/robots.ts"), /dynamic = "force-dynamic"/);
  assert.match(source("src/app/layout.tsx"), /generateMetadata/);
  assert.match(source("src/app/layout.tsx"), /index: isPublicSite\(\)/);
  assert.doesNotMatch(source("src/app/sitemap.ts"), /new Date\(\)/);
  for (const path of ["cart/page", "admin/layout", "order-success/page", "payment-result/page", "login/page", "register/page", "forgot-password/page"]) {
    assert.match(source(`src/app/${path}.tsx`), /index: false/);
  }
  const config = source("next.config.mjs");
  assert.match(config, /htmlLimitedBots: \/\.\*\//);
  assert.match(config, /source: "\/product", destination: "\/products", permanent: true/);
  assert.match(source("src/app/products/[id]/page.tsx"), /if \(!product\) notFound\(\)/);
  assert.equal(existsSync(new URL("../src/app/loading.tsx", import.meta.url)), false, "A global loading boundary would flush a 200 before product lookup finishes");
  assert.match(config, /localPatterns/);
  assert.match(config, /\/uploads\/products\/\*\*/);
  assert.doesNotMatch(config, /pathname: "\/uploads\/\*\*"/);
  for (const path of ["src/app/admin/payment-receipts/page.tsx", "src/app/admin/orders/[id]/page.tsx"]) {
    assert.match(source(path), /unoptimized/);
  }
});
