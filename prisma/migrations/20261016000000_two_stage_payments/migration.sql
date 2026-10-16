-- Additive migration: existing orders/payments/receipts remain single-stage FULL.
CREATE TYPE "PaymentStage" AS ENUM ('FULL', 'DEPOSIT', 'BALANCE');
ALTER TABLE "Order" ADD COLUMN "twoStagePayment" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN "paymentRevision" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "Payment" ADD COLUMN "stage" "PaymentStage" NOT NULL DEFAULT 'FULL';
ALTER TABLE "PaymentReceipt" ADD COLUMN "stage" "PaymentStage" NOT NULL DEFAULT 'FULL';
