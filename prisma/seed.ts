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
    process.env.ADMIN_PHONE ?? "09000000001";

  const adminEmail =
    process.env.ADMIN_EMAIL ?? "admin@lafemme.ir";

  const adminPassword =
    process.env.ADMIN_PASSWORD ?? "Admin@12345";

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
      email: adminEmail,
      firstName: "ادمین",
      lastName: "La Femme",
      passwordHash,
      role: "ADMIN",
      isActive: true,
    },
  });

  console.log(`✅ Admin user created or updated: phone=${adminPhone}`);
  console.log("✅ No default products were created.");
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