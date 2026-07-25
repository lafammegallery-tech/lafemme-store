# La Femme V1.3.0 — Sprint Report

## Scope completed

- Database-first storefront product service with safe mock fallback.
- Dynamic gold/silver product pricing based on weight, purity, premium percentage and fixed premium.
- Separate gold and silver provider services.
- Robust nested API response parsing, timeout, server-side cache and stale fallback.
- Protected POST market sync endpoint for persisting price history.
- Normalized `MarketPrice` schema and migration.
- Product premium fields and production seed data.
- Product list and product detail pages connected to the storefront service.
- Product JSON-LD structured data and enhanced metadata.
- Price and weight sorting.
- Live/fallback price status UI.
- Lazy Prisma initialization so the project can build without a local database while still requiring `DATABASE_URL` for DB operations.

## Verification

- `npm install`: PASS
- `npm run typecheck`: PASS
- `npm run build`: PASS
- Next.js generated 23 routes; `/products` and `/products/[id]` are dynamic server routes.

## Setup

1. Copy `.env.example` to `.env`.
2. Set `DATABASE_URL` and `MARKET_SYNC_SECRET`.
3. Run `npm install`.
4. Run `npm run db:generate`.
5. Run `npm run db:deploy` or `npm run db:migrate`.
6. Run `npm run db:seed`.
7. Run `npm run dev`.

## Note

Prisma client regeneration requires access to Prisma binary servers. The checked project builds with the bundled client; after applying the new migration, run `npm run db:generate` in an internet-enabled environment to regenerate types for the updated schema.
