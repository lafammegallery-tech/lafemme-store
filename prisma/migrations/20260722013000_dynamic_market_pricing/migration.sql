-- Sprint 1.3: dynamic market pricing and normalized market history

-- CreateEnum
CREATE TYPE "MetalType" AS ENUM ('GOLD', 'SILVER', 'PLATINUM');

ALTER TABLE "Product"
  ADD COLUMN IF NOT EXISTS "premiumPercent" DECIMAL(7,3) NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS "fixedPremium" DECIMAL(18,0) NOT NULL DEFAULT 0;

-- Core commerce fields required by the Prisma schema but missing from every
-- prior migration (metalType, price and stock in particular are required by
-- the application on nearly every page that reads a product).
ALTER TABLE "Product"
  ADD COLUMN IF NOT EXISTS "metalType" "MetalType",
  ADD COLUMN IF NOT EXISTS "brand" TEXT NOT NULL DEFAULT 'La Femme',
  ADD COLUMN IF NOT EXISTS "weight" TEXT,
  ADD COLUMN IF NOT EXISTS "weightValue" DOUBLE PRECISION,
  ADD COLUMN IF NOT EXISTS "purity" TEXT,
  ADD COLUMN IF NOT EXISTS "certificate" TEXT,
  ADD COLUMN IF NOT EXISTS "price" DECIMAL(18,0),
  ADD COLUMN IF NOT EXISTS "marketPrice" DECIMAL(18,0),
  ADD COLUMN IF NOT EXISTS "image" TEXT,
  ADD COLUMN IF NOT EXISTS "stock" INTEGER NOT NULL DEFAULT 0;

UPDATE "Product"
SET "metalType" = COALESCE("metalType", 'GOLD'::"MetalType"),
    "price" = COALESCE("price", 0)
WHERE "metalType" IS NULL OR "price" IS NULL;

ALTER TABLE "Product"
  ALTER COLUMN "metalType" SET NOT NULL,
  ALTER COLUMN "price" SET NOT NULL;

CREATE INDEX IF NOT EXISTS "Product_metalType_status_idx" ON "Product"("metalType", "status");
CREATE INDEX IF NOT EXISTS "Product_weightValue_idx" ON "Product"("weightValue");
CREATE INDEX IF NOT EXISTS "Product_brand_idx" ON "Product"("brand");

ALTER TABLE "MarketPrice"
  ADD COLUMN IF NOT EXISTS "metalType" "MetalType",
  ADD COLUMN IF NOT EXISTS "price" DECIMAL(18,2),
  ADD COLUMN IF NOT EXISTS "changePercent" DECIMAL(9,4) NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS "currency" TEXT NOT NULL DEFAULT 'IRR',
  ADD COLUMN IF NOT EXISTS "isStale" BOOLEAN NOT NULL DEFAULT false;

UPDATE "MarketPrice"
SET "price" = COALESCE("price", "value"),
    "metalType" = COALESCE("metalType", CASE WHEN lower("title") LIKE '%silver%' OR "title" LIKE '%نقره%' THEN 'SILVER'::"MetalType" ELSE 'GOLD'::"MetalType" END)
WHERE "price" IS NULL OR "metalType" IS NULL;

ALTER TABLE "MarketPrice"
  ALTER COLUMN "metalType" SET NOT NULL,
  ALTER COLUMN "price" SET NOT NULL,
  ALTER COLUMN "source" SET NOT NULL;

DROP INDEX IF EXISTS "MarketPrice_title_recordedAt_idx";
CREATE INDEX IF NOT EXISTS "MarketPrice_metalType_recordedAt_idx" ON "MarketPrice"("metalType", "recordedAt");
CREATE UNIQUE INDEX IF NOT EXISTS "MarketPrice_metalType_source_recordedAt_key" ON "MarketPrice"("metalType", "source", "recordedAt");

ALTER TABLE "MarketPrice" DROP COLUMN IF EXISTS "title";
ALTER TABLE "MarketPrice" DROP COLUMN IF EXISTS "value";
