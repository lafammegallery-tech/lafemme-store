-- Additive only; existing orders keep the percentage agreed at checkout.
ALTER TABLE "Order" ADD COLUMN "depositPercent" INTEGER;
UPDATE "Order" SET "depositPercent" = 10 WHERE "twoStagePayment" = true;
ALTER TABLE "Order" ADD CONSTRAINT "Order_depositPercent_check"
  CHECK (("twoStagePayment" = true AND "depositPercent" BETWEEN 1 AND 99 AND "depositPercent" IS NOT NULL)
    OR ("twoStagePayment" = false AND "depositPercent" IS NULL));

ALTER TABLE "PaymentMethodConfig"
  ADD COLUMN "minimumAmount" DECIMAL(18,0) NOT NULL DEFAULT 0,
  ADD COLUMN "maximumAmount" DECIMAL(18,0);
ALTER TABLE "PaymentMethodConfig" ADD CONSTRAINT "PaymentMethodConfig_amount_range_check"
  CHECK ("minimumAmount" >= 0 AND ("maximumAmount" IS NULL OR "maximumAmount" > "minimumAmount"));

CREATE TABLE "PaymentPolicy" (
  "id" TEXT NOT NULL DEFAULT 'global',
  "twoStageEnabled" BOOLEAN NOT NULL DEFAULT true,
  "depositPercent" INTEGER NOT NULL DEFAULT 10,
  "thresholdAmount" DECIMAL(18,0) NOT NULL DEFAULT 60000000,
  "revision" INTEGER NOT NULL DEFAULT 0,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  "updatedBy" TEXT,
  CONSTRAINT "PaymentPolicy_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "PaymentPolicy_values_check" CHECK ("depositPercent" BETWEEN 1 AND 99 AND "thresholdAmount" >= 0)
);
INSERT INTO "PaymentPolicy" ("id", "updatedAt") VALUES ('global', CURRENT_TIMESTAMP);
