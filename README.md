# La Femme Store

A gold/silver jewelry storefront built with Next.js App Router, TypeScript, and PostgreSQL (via Prisma 7).

## Architecture

- `src/app` — App Router routes: storefront pages, `admin/*` back office, `api/*` route handlers, and `actions/*` server actions.
- `src/backend` — server-only layer:
  - `database/repositories` — Prisma-backed data access per entity.
  - `services` — business logic (cart, coupons, payments, gold/silver market pricing).
  - `auth`, `security` — session/password handling, rate limiting, input validation.
- `src/components` — UI, grouped by feature (`cart`, `checkout`, `products`, `admin`-facing, etc.) plus a shared `ui` primitive library (see [docs/component-tree.md](docs/component-tree.md)).
- `src/data`, `src/lib`, `src/types` — static/reference data, shared route constants, and domain types.
- `prisma/` — schema, migrations, and `seed.ts` (creates/updates the admin account from env vars — see [docs/admin-account.md](docs/admin-account.md)).

## Local setup

```bash
npm install                # also runs `prisma generate` via postinstall
cp .env.example .env       # then fill in real values
npm run db:migrate         # create the local database schema
npm run db:seed            # create/update the admin account
npm run dev
```

Useful scripts: `npm run check` (typecheck + lint), `npm run db:deploy` (apply migrations without prompting, for CI/production), `npm run market:sync` (trigger a gold/silver price refresh against a running dev server).

## Running with Docker

```bash
cp .env.example .env       # then fill in real values
docker compose up --build
docker compose exec app npm run db:seed   # first time only: create the admin account
```

Migrations run automatically on boot; the app is ready at http://localhost:3000 once `docker compose ps` shows both services `healthy`. Full details, common commands, and troubleshooting: [docs/docker.md](docs/docker.md).

## Further docs

- [docs/docker.md](docs/docker.md) — running the app with Docker Compose, env vars, troubleshooting (فارسی: [docs/docker.fa.md](docs/docker.fa.md)).
- [docs/design-system.md](docs/design-system.md) — design tokens and visual language.
- [docs/component-tree.md](docs/component-tree.md) — shared UI component library map.
- [docs/admin-account.md](docs/admin-account.md) — how the seeded admin account works.
