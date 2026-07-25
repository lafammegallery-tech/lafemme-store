-- Sprint 1.3: dynamic market pricing and normalized market history
ALTER TABLE "Product"
  ADD COLUMN IF NOT EXISTS "premiumPercent" DECIMAL(7,3) NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS "fixedPremium" DECIMAL(18,0) NOT NULL DEFAULT 0;

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
