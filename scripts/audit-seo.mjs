import assert from "node:assert/strict";
import { writeFileSync } from "node:fs";
import { parseArgs } from "node:util";

const { values } = parseArgs({ options: {
  base: { type: "string", default: "http://localhost:8091" },
  "expected-origin": { type: "string" },
  preview: { type: "boolean", default: false },
  out: { type: "string" },
} });
const base = new URL(values.base).origin;
const origin = values["expected-origin"] ?? base;
const checks = [];
const failures = [];
const metrics = [];
const decode = (value) => value.replaceAll("&amp;", "&").replaceAll("&quot;", '"').replaceAll("&#x27;", "'");

async function request(path) {
  const started = performance.now();
  const response = await fetch(new URL(path, base), { redirect: "manual", signal: AbortSignal.timeout(30000) });
  const body = await response.text();
  metrics.push({ path, status: response.status, elapsedMs: Math.round(performance.now() - started) });
  return { response, body };
}

function check(name, condition) {
  checks.push(name);
  if (!condition) failures.push(name);
}

function metadata(html) {
  const tags = [...html.matchAll(/<meta\s[^>]*>/g)].map(([tag]) => Object.fromEntries(
    [...tag.matchAll(/([\w:-]+)="([^"]*)"/g)].map(([, key, value]) => [key, decode(value)]),
  ));
  const canonicalTag = [...html.matchAll(/<link\s[^>]*>/g)].map(([tag]) => Object.fromEntries(
    [...tag.matchAll(/([\w:-]+)="([^"]*)"/g)].map(([, key, value]) => [key, decode(value)]),
  )).find((tag) => tag.rel === "canonical");
  const scripts = [...html.matchAll(/<script[^>]+type="application\/ld\+json"[^>]*>(.*?)<\/script>/gs)].map(([, text]) => JSON.parse(text));
  return {
    title: html.match(/<title>(.*?)<\/title>/s)?.[1] ?? "",
    robots: tags.filter((tag) => ["robots", "googlebot"].includes(tag.name)).map((tag) => tag.content),
    canonical: canonicalTag?.href,
    description: tags.find((tag) => tag.name === "description")?.content,
    schemas: scripts.flatMap((schema) => schema["@graph"] ?? [schema]),
  };
}

try {
  const robots = await request("/robots.txt");
  check("robots serves successfully", robots.response.status === 200);
  check("runtime sitemap URL", robots.body.includes(`Sitemap: ${origin}/sitemap.xml`));
  check("runtime robots host", robots.body.includes(`Host: ${origin}`));
  check("robots indexing policy", values.preview ? robots.body.includes("Disallow: /\n") : robots.body.includes("Allow: /\n") && !robots.body.includes("Disallow: /\n"));

  const sitemap = await request("/sitemap.xml");
  check("sitemap serves successfully", sitemap.response.status === 200);
  const urls = [...sitemap.body.matchAll(/<loc>(.*?)<\/loc>/g)].map(([, url]) => decode(url));
  check("sitemap contains public catalog", urls.includes(`${origin}/products`));
  check("sitemap URLs use runtime origin", urls.every((url) => new URL(url).origin === origin));
  check("sitemap URLs are unique", new Set(urls).size === urls.length);
  check("sitemap excludes private and search pages", urls.every((url) => !/\/(admin|dashboard|orders|cart|checkout|search|login|register)(\/|$)/.test(new URL(url).pathname)));

  const publicPaths = ["/", "/products", "/about", "/contact", "/faq", "/privacy", "/terms"];
  const productPaths = urls.map((url) => new URL(url).pathname).filter((path) => path.startsWith("/products/"));
  check("sitemap contains actual products", productPaths.length > 0);
  const titles = [];
  for (const path of [...publicPaths, ...productPaths, "/search", "/login", "/register", "/forgot-password", "/payment-result"]) {
    const { response, body } = await request(path);
    check(`${path}: successful SSR`, response.status === 200 && !body.includes("NEXT_REDIRECT"));
    const data = metadata(body);
    check(`${path}: unique nonempty title`, data.title.length > 0 && !titles.includes(data.title));
    titles.push(data.title);
    check(`${path}: no repeated brand suffix`, !/\| La Femme \| La Femme/.test(data.title));
    const noindex = values.preview || ![...publicPaths, ...productPaths].includes(path);
    check(`${path}: correct indexing metadata`, noindex
      ? data.robots.some((rule) => /\bnoindex\b/.test(rule)) && !data.robots.some((rule) => /\bindex\b/.test(rule))
      : data.robots.some((rule) => /\bindex\b/.test(rule)) && !data.robots.some((rule) => /\bnoindex\b/.test(rule)));
    const organization = data.schemas.find((schema) => schema["@type"] === "Organization");
    const website = data.schemas.find((schema) => schema["@type"] === "WebSite");
    check(`${path}: organization and website schema`, organization?.url === `${origin}/` && website?.url === `${origin}/`);
    if ([...publicPaths, ...productPaths].includes(path)) {
      check(`${path}: description exists`, Boolean(data.description));
      check(`${path}: canonical matches public URL`, data.canonical === (path === "/" ? `${origin}/` : `${origin}${path}`) || path === "/" && data.canonical === origin);
      check(`${path}: SSR main heading`, (body.match(/<h1(?:\s|>)/g) ?? []).length === 1);
    }
    if (path === "/products" || path.startsWith("/products/")) {
      const breadcrumb = data.schemas.find((schema) => schema["@type"] === "BreadcrumbList");
      check(`${path}: breadcrumb schema`, breadcrumb?.itemListElement.at(-1)?.item === `${origin}${path}`);
    }
    if (path.startsWith("/products/")) {
      const product = data.schemas.find((schema) => schema["@type"] === "Product");
      check(`${path}: product schema URL`, product?.url === `${origin}${path}`);
      check(`${path}: absolute product images`, product?.image?.length > 0 && product.image.every((url) => /^https?:\/\//.test(url)));
      check(`${path}: no invented reviews`, !product.aggregateRating && !product.review);
      if (body.includes("قیمت موقت فروشگاه")) check(`${path}: unavailable quote not advertised as offer`, !product.offers);
      else check(`${path}: current offer`, product.offers?.price > 0 && product.offers.priceCurrency === "IRR" && product.offers.url === `${origin}${path}`);
    }
    if (path === "/faq") {
      const faq = data.schemas.find((schema) => schema["@type"] === "FAQPage");
      check("FAQ schema mirrors all visible answers", faq?.mainEntity?.length === 14 && faq.mainEntity.every((question) => body.includes(question.name) && body.includes(question.acceptedAnswer.text)));
    }
    if (path === "/") {
      check("hero uses responsive image optimization", body.includes("/_next/image?") && body.includes("srcSet="));
    }
  }
  const redirect = await request("/product");
  check("legacy product route permanently redirects", redirect.response.status === 308 && redirect.response.headers.get("location") === "/products");
  const missing = await request("/products/seo-audit-missing-product");
  check("missing product returns 404", missing.response.status === 404);

  assert.equal(failures.length, 0, failures.join("; "));
  const report = { passed: true, base, origin, preview: values.preview, productPages: productPaths.length, checks: checks.length, metrics };
  if (values.out) writeFileSync(values.out, JSON.stringify(report, null, 2));
  console.log(JSON.stringify(report, null, 2));
} catch (error) {
  const report = { passed: false, base, origin, checks: checks.length, failures, error: error.message, metrics };
  if (values.out) writeFileSync(values.out, JSON.stringify(report, null, 2));
  console.error(JSON.stringify(report, null, 2));
  process.exitCode = 1;
}
