import "dotenv/config";
import { randomBytes, scrypt } from "node:crypto";
import { promisify } from "node:util";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";

const scryptAsync = promisify(scrypt);
const connectionString = process.env.DATABASE_URL;
if (!connectionString) throw new Error("DATABASE_URL is required for seed");
const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString }) });

async function hashPw(password: string): Promise<string> {
  const salt = randomBytes(16).toString("hex");
  const hash = ((await scryptAsync(password, salt, 64)) as Buffer).toString("hex");
  return `scrypt:${salt}:${hash}`;
}

async function main() {
  console.log("🌱 Starting seed...");

  const adminPhone = process.env.ADMIN_PHONE ?? "09000000001";
  const adminPassword = process.env.ADMIN_PASSWORD ?? "Admin@12345";
  const existingAdmin = await prisma.user.findUnique({ where: { phone: adminPhone } });
  if (!existingAdmin) {
    await prisma.user.create({
      data: {
        phone: adminPhone,
        email: process.env.ADMIN_EMAIL ?? undefined,
        firstName: "ادمین",
        lastName: "La Femme",
        passwordHash: await hashPw(adminPassword),
        role: "ADMIN",
        isActive: true,
      },
    });
    console.log(`✅ Admin user created: phone=${adminPhone}`);
  } else {
    console.log(`ℹ️  Admin user already exists: ${adminPhone}`);
  }

  console.log("✅ Seed completed.");
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
