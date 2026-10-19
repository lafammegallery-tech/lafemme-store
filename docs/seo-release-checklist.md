# Technical SEO release checklist

The October 2026 SEO patch is prepared on preview first. It does not register any external account or submit pages to Google.

## Before release

- `npm run check`, `npm test`, `node scripts/audit-routes.mjs`.
- Build without a database or a production domain, as in the normal Docker pipeline.
- Preview runtime: `NEXT_PUBLIC_SITE_URL=http://localhost:8091`. Verify `noindex` metadata and `Disallow: /`.
- Isolated production-domain simulation: use the same image, preview database and read-only preview upload volume. Bypass the image entrypoint (no migration or seed). Use `NEXT_PUBLIC_SITE_URL=https://lafemmebar.com` without exposing any host ports.
- Run `node scripts/audit-seo.mjs --base <URL> --expected-origin <origin> [--preview] --out <report.json>` for both environments.
- Verify resized public images return 200 and the optimizer rejects `/uploads/receipts/`, API paths and arbitrary remote URLs. Uploaded receipts must remain `unoptimized` and authenticated.
- Check responsive UI, no broken visible images, usable product filtering and FAQ interaction.
- Compare production container IDs/images, preview business-table rows and upload checksums before/after deployment.

## After explicit production approval

- Back up the database and uploads; retain the previous image for rollback.
- Deploy using the existing production release process. Do not copy preview data to production.
- Check `robots.txt`: `Allow: /`, correct HTTPS sitemap/host, no global production `noindex`.
- Check private pages remain `noindex`; robots rules alone are not access control.
- Metadata is resolved before streaming (`htmlLimitedBots`) and the global loading boundary is intentionally absent so nonexistent products return an actual 404. `/product` is a server-level permanent redirect. Check both HTTP status codes; don't settle for a 200 page containing a client-side redirect.
- Repeat the SEO audit against the actual domain and confirm CSS, images, checkout/auth smoke and data integrity.
- Sitemap product `lastmod` uses the real product update timestamp, not the time of each sitemap request. Price availability may change independently. No invented timestamps, ratings, reviews, shipping promises or certifications.
- Product prices use IRR in structured data (one conversion from displayed toman); no `Offer` is emitted when a current valid quote is unavailable.

## Owner tasks / permissions required

1. Verify domain ownership in Google Search Console using the owner's Google account. Domain verification may require a DNS TXT record; do not change DNS without approval.
2. After production release, submit `https://lafemmebar.com/sitemap.xml` and inspect the home, catalog and representative product URLs. Indexing is Google's decision, not guaranteed by submission.
3. Review Search Console indexing, queries/clicks and Core Web Vitals over time. Local/headless timing is diagnostic, not real-user field CWV.
4. Confirm business name, address, phone, Instagram and hours with the owner before changing them. Organization schema currently mirrors published about/contact information.
5. Business Profile has geographic eligibility restrictions: a business physically located in Iran is not currently supported. Do not create a listing using a false foreign address. Use truthful business details on supported directories instead and recheck official availability before any registration.
6. Plan original, accurate buying guides and product descriptions based on actual specifications. Do not publish made-up expertise, guaranteed investment returns, keyword-stuffed or duplicate landing pages.

Schema does not guarantee a rich result or ranking increase. Google limits FAQ rich results mainly to authoritative government/health sites; the store's FAQ markup is semantic only, not a promise of expanded Google snippets. No obsolete sitelinks search box schema is added.
