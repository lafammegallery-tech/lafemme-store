import { test } from "node:test";
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { absoluteUrl, getSiteUrl, isPublicSite, safeJsonLd, breadcrumbSchema, productSchema } from "../src/lib/seo";
import robots from "../src/app/robots";
import type { Product } from "../src/types/product";
import { brandName, brandAlternateNames, brandDisplayName, brandHomeTitle, brandDescription } from "../src/lib/brand";
import { getProductEditorial, productEditorialDrafts, withProductEditorial } from "../src/lib/product-editorial";
import { buyingGuides, getBuyingGuide } from "../src/data/buying-guides";

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

test("owner-confirmed Persian brand is visible and linked to the established English names", () => {
  const source = (path: string) => readFileSync(new URL(`../src/${path}`, import.meta.url), "utf8");
  assert.equal(brandName, "لفم");
  assert.deepEqual(brandAlternateNames, ["La Femme", "La Femme Gold"]);
  assert.equal(brandDisplayName, "لفم (La Femme)");
  assert.equal(brandHomeTitle, "لفم | خرید شمش طلا و نقره");
  assert.ok(brandDescription.includes(brandDisplayName));
  const layout = source("app/layout.tsx");
  assert.equal((layout.match(/name: brandName,/g) ?? []).length, 2);
  assert.equal((layout.match(/alternateName: brandAlternateNames,/g) ?? []).length, 2);
  assert.match(layout, /siteName: brandName/);
  assert.match(layout, /template: "%s \| لفم"/);
  assert.match(source("app/page.tsx"), /title: \{ absolute: brandHomeTitle \}/);
  for (const path of ["components/home/HeroSection.tsx", "components/layout/SiteFooter.tsx", "app/about/page.tsx", "app/contact/page.tsx", "app/products/page.tsx"]) {
    assert.ok(source(path).includes(brandDisplayName), `${path}: readable Persian and English brand`);
  }
  // Do not relabel third-party manufacturers as the storefront brand.
  assert.equal(productSchema({ ...product, brand: "Nadir" }).brand.name, "Nadir");
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

test("all 20 catalogue editorials only change matching product copy, never commercial fields", () => {
  assert.equal(productEditorialDrafts.length, 20);
  assert.equal(new Set(productEditorialDrafts.map((draft) => draft.id)).size, 20);
  assert.equal(new Set(productEditorialDrafts.map((draft) => draft.description)).size, 20);
  assert.equal(new Set(productEditorialDrafts.map((draft) => draft.heading)).size, 20);
  assert.equal(productEditorialDrafts.filter((draft) => draft.type === "gold").length, 14);
  assert.equal(productEditorialDrafts.filter((draft) => draft.type === "silver").length, 6);
  for (const draft of productEditorialDrafts) {
    const item: Product = { ...product, id: draft.id, type: draft.type, weightValue: draft.grams, purity: draft.purity, brand: draft.brand };
    const before = structuredClone(item);
    const result = withProductEditorial(item);
    assert.equal(result.description, draft.description);
    assert.match(result.description, /بسته‌بندی ضدجعل/);
    assert.match(result.description, /شماره‌سریال مخفی/);
    assert.match(result.description, /کیفیت و زیبایی/);
    assert.deepEqual({ ...result, description: item.description }, before);
    assert.deepEqual(item, before, "original data is not mutated");
    assert.equal(productSchema(result).description, result.description);
    for (const change of [{ id: "different-id" }, { weightValue: 500 }, { purity: "750" }, { brand: "Nadir" }, { type: draft.type === "gold" ? "silver" as const : "gold" as const }]) {
      const changed = { ...item, ...change };
      assert.equal(getProductEditorial(changed), undefined);
      assert.equal(withProductEditorial(changed), changed);
    }
    assert.ok(getBuyingGuide(draft.guideSlug));
  }
  assert.equal(withProductEditorial(product), product);
});

test("sales copy uses owner-confirmed features without missing-data copy or fabricated guarantees", () => {
  const paths = ["src/lib/product-editorial.ts", "src/data/buying-guides.ts", "src/components/products/ProductBuyingGuide.tsx", "src/app/about/page.tsx", "src/app/guides/page.tsx", "src/app/guides/[slug]/page.tsx"];
  for (const file of paths) {
    const text = readFileSync(new URL(`../${file}`, import.meta.url), "utf8");
    assert.doesNotMatch(text, /اطلاعات.*درج نشده|گواهی مشخصی|ذکر نشده|تضمین سود|سود قطعی|بدون ریسک|غیرقابل جعل|تضمین بازخرید|سامانهٔ استعلام|QR|NFC/);
  }
  const component = readFileSync(new URL("../src/components/products/ProductBuyingGuide.tsx", import.meta.url), "utf8");
  assert.match(component, /href="#product-purchase"/);
  const detail = readFileSync(new URL("../src/app/products/[id]/page.tsx", import.meta.url), "utf8");
  assert.match(detail, /id="product-purchase"/);
  assert.match(detail, /disabled=\{product.stock <= 0\}/, "stock controls remain intact");
  assert.match(detail, /نرخ بازار در دسترس نیست/, "live price status remains truthful");
});

test("buying guides have unique URLs and substantive sections without invented author credentials", () => {
  assert.equal(buyingGuides.length, 3);
  assert.equal(new Set(buyingGuides.map((guide) => guide.slug)).size, 3);
  assert.equal(getBuyingGuide("unknown-guide"), undefined);
  for (const guide of buyingGuides) {
    assert.ok(/^[a-z-]+$/.test(guide.slug));
    assert.ok(guide.sections.length >= 4);
    assert.ok(guide.sections.every((section) => section.title && section.paragraphs.length > 0));
    assert.ok(guide.sections.flatMap((section) => section.paragraphs).join(" ").length > 1000);
  }
  const page = readFileSync(new URL("../src/app/guides/[slug]/page.tsx", import.meta.url), "utf8");
  assert.match(page, /if \(!guide\) notFound\(\)/);
  assert.doesNotMatch(page, /datePublished|dateModified|Person|aggregateRating/);
  const about = readFileSync(new URL("../src/app/about/page.tsx", import.meta.url), "utf8");
  assert.doesNotMatch(about, /سال‌ها تجربه|گواهی اصالت عرضه|سنگ‌های قیمتی|جواهرات میناکاری/);
});
