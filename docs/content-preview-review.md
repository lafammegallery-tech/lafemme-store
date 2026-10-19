# Approved storefront content release

Status: owner reviewed the sales-oriented preview and explicitly authorized deploying this exact version to production ("اوکیه روی سایت اصلی هم اجرا کن"). Production release requires a fresh backup, restore test, source comparison with the approved preview, protected service checks and rollback. DNS changes and submission of preview URLs to Search Console are not authorized.

## Current scope

- All 20 current products: 14 gold weights (100–900 soot, 1g, 2g, 5g, 10g, 20g) and six silver weights (2.5g, 5g, 10g, 20g, 50g, 100g).
- Each product has a distinct short description, heading and weight-specific paragraph, plus metal-specific saving/investment context and a link back to the existing purchase controls.
- Three buying guides, guide index, home guide section and about page rewritten in a positive, purchase-oriented voice.
- Owner explicitly confirmed anti-counterfeit packaging, a hidden serial number, and the quality/beauty of La Femme bars. These claims are used for the matching current La Femme products, not other manufacturers.
- No invented serial values, authentication website, QR/NFC method, certifications, return guarantees, guaranteed returns, ratings, author credentials or business history.
- Missing-information commentary and repetitive negative disclaimers removed from editorial content. Genuine price-feed status, stock controls, actual order policies, payment protections and noindex remain unchanged.

## Data boundaries

`src/lib/product-editorial.ts` is a read-only presentation overlay matched by ID, metal, weight, purity and brand. Product names, manufacturers, prices, stock, certificates and database records are not rewritten. Metadata and Product JSON-LD receive the same description rendered on the page. Unknown or mismatched products retain their original copy.

No database migration, account creation or checkout test is required. Do not remove or conceal genuine operational errors to make copy more promotional. New routes inherit preview noindex/robots blocking. Sitemap dates are not fabricated.

## Verification

- TypeScript, Prisma typecheck and ESLint passed; 45 unit tests passed. Route audit: 42 route patterns with no broken static internal links.
- Fresh preview database and uploads backup restored in isolation before deployment.
- Backup location: `/home/arshia/lafemme-backups/mobile-preview-20261019-205601`.
- Upload uses a compressed, hash-verified payload with staged file replacement rather than direct SFTP writes to avoid partially transferred files.
- Production release was authorized after these preview checks. Pre-release production revision is `197e4d4`; final deployment/HTTP/browser results are recorded separately in the production operations reports.
- Deployed preview image: `sha256:86e40233570f5e5ae1de014810dc6a4666240c1eb6375cf3feb2f087fc72fa22`.
- All 18 application source files matched local content after line-ending normalization; 276 HTTP checks passed across all 20 products, three guides, noindex, sitemap, purchase anchors and production isolation.
- Browser verification passed 182 layout scenarios across mobile/desktop sizes and both themes; search/filter/sort, guide contents anchors and FAQ keyboard interaction passed. Product mobile and guide desktop screenshots were reviewed.
- Technical SEO audit passed 391 preview checks and 391 isolated production-origin simulation checks; no production deployment was performed.
- Final preview business-table and upload checksums matched the backup. Protected production container identities remained unchanged.
