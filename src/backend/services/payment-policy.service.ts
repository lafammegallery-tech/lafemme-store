import "server-only";
import { getPrisma } from "@/backend/database/prisma";
import type { Prisma } from "@/generated/prisma/client";
import { DEFAULT_PAYMENT_POLICY, type PaymentPolicyValues } from "@/lib/payment-policy";

export async function getPaymentPolicy(client: Prisma.TransactionClient = getPrisma()): Promise<PaymentPolicyValues> {
  const row = await client.paymentPolicy.findUnique({ where: { id: "global" } });
  return row ? { twoStageEnabled: row.twoStageEnabled, depositPercent: row.depositPercent, thresholdAmount: Number(row.thresholdAmount), revision: row.revision } : { ...DEFAULT_PAYMENT_POLICY };
}
