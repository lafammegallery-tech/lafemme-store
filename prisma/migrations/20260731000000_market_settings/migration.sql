-- CreateTable
CREATE TABLE IF NOT EXISTS "MarketSettings" (
    "id" TEXT NOT NULL DEFAULT 'global',
    "isManualMode" BOOLEAN NOT NULL DEFAULT false,
    "manualGold750" DECIMAL(18,0),
    "manualSilver999" DECIMAL(18,0),
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedBy" TEXT,
    CONSTRAINT "MarketSettings_pkey" PRIMARY KEY ("id")
);
