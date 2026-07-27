# Backlog / next steps

Snapshot from the 2026-07-27 session. What shipped that session vs. what's still open, so the next person (or the next AI session) doesn't have to rediscover it.

## Shipped this session

- Light/dark theme toggle, unified color-token system (`globals.css` variables ↔ `tailwind.config.ts`).
- Fixed post-login redirect (`next` param was silently dropped everywhere).
- Fixed a guest `/cart`/`/checkout` crash (cookie mutation during a page render).
- Fixed `/profile` and `/wishlist` being cacheable despite being auth-gated.
- Profile page was 100% fake (`"کاربر نمونه"` placeholder, save button just showed a toast) — now backed by real user data and a real update action.
- Header/mobile nav account link always pointed at `/login` even when already signed in, and never surfaced the admin panel — fixed via a client-side `AccountLink`/`MobileNavigation` that read a lightweight, non-secret `lf_role` cookie (kept the header a plain Server Component so pages stay statically cacheable — see perf note below).
- Session auth swapped from a hand-rolled HMAC token to a standard JWT (`jose`, HS256) — same external API, so nothing else needed to change.
- Added a real REST API surface under `/api/admin/*` (products, orders, users — list/detail/create/update/delete) protected by `requireAdminApi()`, alongside the existing server-rendered admin UI (didn't rip that out — see "API-first rewrite" below for why).
- Admin panel is now discoverable (header link + dashboard card for admin/staff roles) and admins can promote/demote other users to ADMIN from `/admin/users` (previously only possible by editing the seed script).
- Added login/register rate limiting (`assertRateLimit` existed but was never actually called anywhere — zero brute-force protection before this).
- Fixed `requireAdmin()` to thread the `next` redirect path through too (it was hard-coded, same class of bug as the general redirect fix above, just missed on the first pass — visiting `/admin` while logged out sent you to `/login?next=/dashboard` instead of back to `/admin`).
- **Fixed a severe, currently-live performance bug**: the silver price API (see below — permanently blocked) was retried on *every single request* to the home/products pages with an 8s timeout, adding 2–8 real seconds to every page load. Added a simple in-memory circuit breaker in `market-price.service.ts` (`fetchProviderQuote`) — on failure, skip retrying that provider for 60s and return the stale placeholder immediately. Verified: product pages went from 2–7.5s to ~10–60ms per request.
- Confirmed the gold price API (`talasea.ir`) is live and working. Silver (`noghresea.ir`) is not — see below.
- Fixed a silent error-swallow in `storefront-product.service.ts` (`loadDbProducts`'s `catch` block logged nothing) — see the ISR postmortem below for why this mattered more than it looks.

## Postmortem: an ISR "performance fix" that was actually a regression

Initially converted `/products` and `/products/[id]` from `force-dynamic` to `export const revalidate = 300` (time-based ISR), reasoning that neither page reads session/cart state and prices only need 5-minute freshness. `next build`'s output table looked right (`○` instead of `ƒ`) and it typechecked clean — but an independent test pass (a parallel multi-agent verification run against the live Docker container, not just static build output) caught that **every visit to `/products` was serving 6 fake products with ids `"1"`–`"6"` and completely broken links**, not real data.

Root cause: this project's Docker build has **no database connection at build time** (migrations/seeding happen at container *start*, via the entrypoint — by design, see [docs/docker.md](docker.md)). Once `/products` became ISR-eligible, `next build` tried to pre-render it *during the image build*, where `loadDbProducts()` necessarily fails (no DB), silently falls back to the static mock catalog (`src/data/products.ts`, ids `"1"`–`"6"`), and — because nothing threw — that broken render got baked into the image as the "successful" static/ISR snapshot, served to every real visitor until the revalidate window happened to line up with a request after the DB was actually reachable.

This is precisely the trap of judging ISR safety from `next build`'s summary table alone. **Reverted both pages to `force-dynamic`** (with a comment in the source explaining why, so nobody "fixes" this again the same way) — this is correct for any DB-backed page in a project shaped like this one: build time and runtime have different data availability, and static-generation eligibility needs to account for that, not just "does this page read cookies/session." The circuit-breaker fix above already addressed the actual latency problem, so reverting the ISR change costs effectively nothing.

**If you want real caching for these pages**, don't reach for page-level `revalidate` again without solving the build-time problem first — either give the Docker build stage a real (even empty/seeded-only-for-build) database connection, or cache at the *data* layer (e.g. `unstable_cache` around `getStorefrontProducts()` with a runtime-only, request-triggered TTL) rather than the *page* layer, since a data-layer cache is never invoked during `next build` and can't get build-time-poisoned the same way.

## Known limitations / explicitly not done

- **Silver price API is effectively dead.** `noghresea.ir` sits behind Arvan Cloud bot-protection (a JS/cookie challenge) that a plain server-side `fetch` can't solve, so it always returns `stale: true, price: 0` (this is already handled gracefully — no crash — but the price is never real). Needs either a different public Iranian silver price API, or a headless-browser-based fetcher (expensive to run per-request; would need its own cache layer).
- **"Use API calls, not render all things" was only partially done.** A full rewrite of every page from Server-Component rendering to client components + API fetches was **not** done — it would add client-server round trips to pages that are currently fast SSR/ISR, directly working against the performance ask. What shipped instead: a genuine `/api/admin/*` REST surface for the admin resources, so an external client (mobile app, another service) has something real to call. If a full API-first architecture is still wanted, treat it as its own project — it's a rewrite of most of `src/app/*/page.tsx`, not an incremental patch.
- **No automated test suite.** Everything this session was verified with ad hoc Playwright scripts run by hand against the live Docker container, not committed anywhere. Worth promoting into a real `tests/` directory with Playwright as a devDependency + a CI job, so these regressions (redirects, cart crash, stale-cache auth bypass) get caught automatically next time instead of by a user reporting "it's broken."
- **Rate limiting is in-memory (`Map`), single-instance only.** Fine for one container; if this ever runs more than one replica behind a load balancer, limits need to move to Redis or similar shared store.
- **Payment is `MOCK` only.** `PAYMENT_PROVIDER=MOCK` in `.env.example`; no real gateway (Zarinpal, IDPay, etc.) is wired up.
- **`ForgotPasswordForm` is a disabled stub** (`src/components/auth/AuthForms.tsx`) — no SMS/OTP delivery exists yet.
- **Docker image doesn't use Next's `output: "standalone"`.** Current multi-stage build (prod-deps + builder) is already reasonably lean and was deliberately not switched to standalone mode this session, because the entrypoint needs the full `prisma` CLI for `migrate deploy`/`db:seed`, and mixing standalone's traced runtime with a separate full node_modules set for the CLI adds real Dockerfile complexity for a marginal image-size win. Worth revisiting if image size/cold-start actually becomes a problem.
- **Farsi typography got a correctness fix, not a redesign.** Two `font-weight: 800` rules were requesting a weight that was never loaded (only 400/500/600/700 `Vazirmatn` files are bundled), so the browser was faking bold via synthetic rendering — fixed to use the real 700 weight. If "better font" means an actual different typeface, that's a separate decision: needs picking a font, verifying its Persian/Arabic glyph coverage and license, and sourcing the actual files (not something to do without those files in hand).

## Suggested priority order for next session

1. Stand up a real Playwright test suite from the ad hoc scripts written this session (they already cover redirects, cart/checkout, admin CRUD, theming) — highest leverage, prevents regressions.
2. Decide on the silver price API — either find a working alternative or drop the silver ticker until one exists, rather than silently showing `stale`.
3. Wire a real payment gateway if this is heading toward production.
4. SMS/OTP for password reset.
5. Only then consider the bigger architectural questions (full API-first rewrite, Docker standalone output, font swap) — each is a real project, not an afternoon patch.
