import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@/generated/prisma/client";

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

/**
 * Prisma به‌صورت lazy ساخته می‌شود تا build و صفحات fallback بدون DATABASE_URL شکست نخورند.
 * در محیط production نبود DATABASE_URL خطای روشن ایجاد می‌کند.
 */
export function getPrisma(): PrismaClient {
  if (globalForPrisma.prisma) return globalForPrisma.prisma;

  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error("DATABASE_URL تنظیم نشده است. فایل .env را بر اساس .env.example بسازید.");
  }

  const adapter = new PrismaPg({ connectionString });
  const client = new PrismaClient({ adapter });
  if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = client;
  return client;
}
