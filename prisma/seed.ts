import "dotenv/config";
import { randomBytes, scrypt } from "node:crypto";
import { promisify } from "node:util";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";

const scryptAsync = promisify(scrypt);

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL is required for seed");
}

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString }),
});

async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16).toString("hex");

  const hash = (
    (await scryptAsync(password, salt, 64)) as Buffer
  ).toString("hex");

  return `scrypt:${salt}:${hash}`;
}

async function main(): Promise<void> {
  console.log("🌱 Starting seed...");

  const adminPhone =
    process.env.ADMIN_PHONE;
  if (!adminPhone || !/^09\d{9}$/.test(adminPhone)) throw new Error("Set a valid ADMIN_PHONE.");

  const adminEmail =
    process.env.ADMIN_EMAIL || null;

  const adminPassword =
    process.env.ADMIN_PASSWORD;
  if (!adminPassword || adminPassword.length < 12 || adminPassword.startsWith("change-")) throw new Error("Set a unique ADMIN_PASSWORD of at least 12 characters.");

  const passwordHash = await hashPassword(adminPassword);

  await prisma.user.upsert({
    where: {
      phone: adminPhone,
    },

    create: {
      phone: adminPhone,
      email: adminEmail,
      firstName: "ادمین",
      lastName: "La Femme",
      passwordHash,
      role: "ADMIN",
      isActive: true,
    },

    update: {
      ...(process.env.RESET_ADMIN_PASSWORD === "true" ? { passwordHash } : {}),
    },
  });

  console.log(`✅ Admin user created or updated: phone=${adminPhone}`);
  console.log("✅ No default products were created.");

  // روش‌های پرداخت پیش‌فرض — فقط در صورت خالی‌بودن جدول ساخته می‌شوند.
  if ((await prisma.paymentMethodConfig.count()) === 0) {
    await prisma.paymentMethodConfig.createMany({
      data: [
        {
          name: "کارت به کارت",
          type: "CARD_TO_CARD",
          description: "مبلغ را به کارت زیر واریز و تصویر رسید را بارگذاری کنید.",
          cardNumber: null,
          isActive: false,
          cardHolder: "لافمگلد",
          bankName: "بانک ملی",
          requiresReceipt: true,
          sortOrder: 0,
        },
        {
          name: "پرداخت در محل (تحویل حضوری)",
          type: "CASH_ON_DELIVERY",
          isActive: false,
          description: "پرداخت هنگام تحویل حضوری در فروشگاه.",
          requiresReceipt: false,
          sortOrder: 1,
        },
      ],
    });
    console.log("✅ Default payment methods created.");
  }

  // روش‌های ارسال پیش‌فرض
  if ((await prisma.shippingMethodConfig.count()) === 0) {
    await prisma.shippingMethodConfig.createMany({
      data: [
        { name: "پیک امین", description: "ارسال امن با پیک اختصاصی", cost: "500000", sortOrder: 0 },
        { name: "پست پیشتاز", description: "ارسال با پست به سراسر کشور", cost: "300000", sortOrder: 1 },
        { name: "تحویل حضوری", description: "دریافت سفارش از فروشگاه", cost: "0", sortOrder: 2 },
      ],
    });
    console.log("✅ Default shipping methods created.");
  }

  console.log("✅ Seed completed.");
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error: unknown) => {
    console.error("❌ Seed failed:", error);
    await prisma.$disconnect();
    process.exit(1);
  });
