import fs from "node:fs";
import path from "node:path";

const walk = (dir) => fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
  const full = path.join(dir, entry.name);
  return entry.isDirectory() ? walk(full) : [full];
});

const appDir = path.resolve("src/app");
const srcDir = path.resolve("src");
const pages = walk(appDir).filter((file) => file.endsWith("page.tsx"));
const routes = new Set(pages.map((file) => {
  const rel = path.relative(appDir, path.dirname(file)).replaceAll(path.sep, "/");
  return rel ? `/${rel}` : "/";
}));

const matchesRoute = (route, href) => {
  if (route === href) return true;
  const routeParts = route.split("/");
  const hrefParts = href.split("/");
  if (routeParts.length !== hrefParts.length) return false;
  return routeParts.every((part, index) =>
    /^\[[^/]+\]$/.test(part) || part === hrefParts[index]
  );
};

const missing = [];
for (const file of walk(srcDir).filter((file) => /\.(ts|tsx)$/.test(file))) {
  const text = fs.readFileSync(file, "utf8");
  for (const match of text.matchAll(/href=["'](\/[^"'#?]*)/g)) {
    const href = match[1].replace(/\/$/, "") || "/";
    if (![...routes].some((route) => matchesRoute(route, href))) {
      missing.push(`${path.relative(process.cwd(), file)} -> ${href}`);
    }
  }
}

if (missing.length) {
  console.error(`Broken internal links:\n${missing.join("\n")}`);
  process.exit(1);
}

console.log(`Route audit passed: ${routes.size} pages, no broken static internal links.`);
