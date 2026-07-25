# Phase 1 File Guide

## Root configuration

- `package.json` — Defines Next.js, React, TypeScript, Tailwind, build, lint, and type-check commands.
- `package-lock.json` — Locks exact dependency versions for reproducible installs.
- `next.config.mjs` — Enables strict React behavior and removes the framework signature header.
- `tsconfig.json` — Enables strict TypeScript, App Router support, and the `@/*` source alias.
- `next-env.d.ts` — Loads Next.js TypeScript declarations.
- `tailwind.config.ts` — Scans the source tree and disables Preflight to preserve the existing UI.
- `postcss.config.mjs` — Runs Tailwind and Autoprefixer during CSS compilation.
- `.eslintrc.json` — Applies Next.js Core Web Vitals linting rules.
- `.gitignore` — Excludes generated builds, dependencies, local environments, and logs.
- `README.md` — Explains installation, architecture, and the compatibility-first migration strategy.
- `migration-manifest.json` — Maps each original HTML file to its new App Router route and scripts.
- `FILES.md` — Brief explanation of every Phase 1 file and directory.

## App Router

- `src/app/layout.tsx` — Root Persian RTL layout and shared metadata.
- `src/app/globals.css` — Tailwind layers followed by the complete original stylesheet.
- `src/app/page.tsx` — Migrated home page.
- `src/app/not-found.tsx` — Migrated custom 404 entry.
- `src/app/about/page.tsx` — Migrated About page.
- `src/app/addresses/page.tsx` — Preserves the existing empty Addresses page.
- `src/app/cart/page.tsx` — Migrated Cart page.
- `src/app/checkout/page.tsx` — Migrated Checkout page.
- `src/app/contact/page.tsx` — Migrated Contact page.
- `src/app/dashboard/page.tsx` — Migrated Dashboard page.
- `src/app/login/page.tsx` — Migrated Login page.
- `src/app/orders/page.tsx` — Migrated Orders page.
- `src/app/product/page.tsx` — Migrated product-detail page with original data and pricing scripts.
- `src/app/products/page.tsx` — Migrated product-list page with original filtering and rendering scripts.
- `src/app/profile/page.tsx` — Migrated Profile page.
- `src/app/register/page.tsx` — Migrated Register page.
- `src/app/wishlist/page.tsx` — Preserves the existing empty Wishlist page.

## Shared components

- `src/components/layout/SiteShell.tsx` — Shared shell for preserved header, page content, and footer variants.
- `src/components/legacy/LegacyMarkup.tsx` — Safely centralizes rendering of preserved legacy HTML.
- `src/components/legacy/LegacyScripts.tsx` — Loads original scripts in their page-specific order.
- `src/components/ui/Container.tsx` — Reusable wrapper using the existing `.container` class.
- `src/components/ui/ButtonLink.tsx` — Reusable Next.js link using the existing button classes.

## Shared application definitions

- `src/lib/routes.ts` — Central route constants for future component conversion.
- `src/types/product.ts` — Strict TypeScript definitions for the current product model.

## Public assets

- `public/assets/css/*` — Original modular and primary CSS files retained as migration references.
- `public/assets/data/*` — Original product, market, category, and settings data files.
- `public/assets/fonts/*` — Original Vazirmatn font files served from stable public paths.
- `public/assets/images/*` — Original project images; `logo.png` is added as a case-safe copy of `Logo.png`.
- `public/assets/js/*` — Original scripts retained to preserve existing client behavior.

## Preserved source

- `legacy-source/*` — Untouched copy of the entire original project, including every source comment.

## Generated locally, not included in the delivery archive

- `node_modules/` — Installed dependencies.
- `.next/` — Verified production build output.
- `tsconfig.tsbuildinfo` — TypeScript incremental compilation cache.
