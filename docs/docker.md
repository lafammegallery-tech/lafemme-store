# Running with Docker

## Quick start

```bash
cp .env.example .env       # then fill in real values (API URLs, secrets, admin credentials)
docker compose up --build
```

This builds the app image and starts two services:

- `postgres` — Postgres 16, data persisted in the `lafemme_postgres` volume.
- `app` — the Next.js app. Its entrypoint ([docker/entrypoint.sh](../docker/entrypoint.sh)) runs `prisma migrate deploy` automatically before `next start`, so a brand-new database is fully migrated on first boot — no manual migration step needed.

Once both containers report `healthy` (`docker compose ps`), the app is available at http://localhost:3000.

## First-time setup: seeding the admin account

Migrations run automatically, but seeding does not (seeding is idempotent-ish but not something you want re-run silently on every restart). Run it once after the first `up`:

```bash
docker compose exec app npm run db:seed
```

This creates the admin user from `ADMIN_PHONE` / `ADMIN_EMAIL` / `ADMIN_PASSWORD` in `.env`, plus sample gold/silver products. See [docs/admin-account.md](admin-account.md) for details on the seeded admin account.

## Verifying it's up

```bash
docker compose ps                         # both services should show "healthy"
curl http://localhost:3000/api/health     # {"status":"ok","database":"up",...}
```

## Common commands

```bash
docker compose up -d --build      # rebuild and start in the background
docker compose logs -f app        # follow app logs (migrations run at the top of the log on boot)
docker compose exec app sh        # shell into the running app container
docker compose down               # stop containers, keep the postgres volume (data persists)
docker compose down -v            # stop containers AND wipe the postgres volume (fresh start)
docker compose restart app        # restart just the app (re-runs migrate deploy on boot)
```

## Environment variables

The `app` service reads each variable from your shell/`.env` via `${VAR:-default}` substitution in [docker-compose.yml](../docker-compose.yml) — see `.env.example` for the full list (gold/silver price API URLs, `AUTH_SECRET`, `MARKET_SYNC_SECRET`, payment provider config, admin seed credentials). `DATABASE_URL` is the one exception: compose always overrides it to point at the internal `postgres` service, regardless of what's in `.env` — you don't need to (and shouldn't) set it yourself for the Docker flow.

To change a value, edit `.env` and recreate the app container:

```bash
docker compose up -d --force-recreate app
```

## How the image is built

[Dockerfile](../Dockerfile) is a four-stage build:

1. `deps` — installs full dependencies for the build.
2. `builder` — runs `prisma generate` and `next build`.
3. `prod-deps` — a clean `npm ci --omit=dev` install, so devDependencies (eslint, typescript, tailwind, prettier) never end up in the runtime image.
4. `runner` — assembles the final image from `prod-deps` node_modules plus the built `.next`, `public`, `prisma/`, `prisma.config.ts`, and the generated Prisma client from `builder`. Runs as a non-root `nextjs` user.

The runtime image needs `prisma.config.ts` (not just the `prisma/` folder) because `prisma migrate deploy` reads the datasource URL from it — easy to miss if you're editing the Dockerfile, since the file lives at the repo root rather than inside `prisma/`.

## Troubleshooting

- **App container keeps restarting, logs show a Prisma/migration error**: check `docker compose logs app`. A missing/wrong `DATABASE_URL` or an unreachable `postgres` service are the usual causes — confirm `docker compose ps` shows `postgres` as `healthy` first.
- **Healthcheck never turns healthy**: `curl http://localhost:3000/api/health` directly to see the actual error; a `503` with `"database":"down"` means the app started but can't reach Postgres.
- **Changed `.env` but the app still uses old values**: environment variables are baked into the container at creation time, not read live — recreate the container (`docker compose up -d --force-recreate app`), a plain restart isn't enough.
- **Want to reset everything**: `docker compose down -v` removes the Postgres volume too, so the next `up` starts from a completely empty database (migrations still run automatically; seeding does not).
