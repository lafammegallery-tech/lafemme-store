import "dotenv/config";
import { randomBytes, scrypt } from "node:crypto";
import { promisify } from "node:util";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient, MetalType, ProductStatus } from "../src/generated/prisma/client";

const scryptAsync = promisify(scrypt);
const connectionString = process.env.DATABASE_URL;
if (!connectionString) throw new Error("DATABASE_URL is required for seed");
const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString }) });

// این تابع رمز عبور را هش می‌کند
async function hashPw(password: string): Promise<string> {
  const salt = randomBytes(16).toString("hex");
  const hash = ((await scryptAsync(password, salt, 64)) as Buffer).toString("hex");
  return `scrypt:${salt}:${hash}`;
}

const catalog = [
  { name: "شمش طلای ۱۸ عیار یک گرمی",  slug: "gold-bar-18k-1g",  metalType: MetalType.GOLD,   weight: "۱ گرم",  weightValue: 1,  purity: "عیار ۱۸",  price: 18_500_000,  stock: 12, premiumPercent: 5   },
  { name: "شمش طلای ۱۸ عیار پنج گرمی",  slug: "gold-bar-18k-5g",  metalType: MetalType.GOLD,   weight: "۵ گرم",  weightValue: 5,  purity: "عیار ۱۸",  price: 92_000_000,  stock: 8,  premiumPercent: 4   },
  { name: "شمش طلای خالص ۱۰ گرمی",      slug: "gold-bar-24k-10g", metalType: MetalType.GOLD,   weight: "۱۰ گرم", weightValue: 10, purity: "عیار ۲۴",  price: 185_000_000, stock: 5,  premiumPercent: 3.5 },
  { name: "شمش نقره خالص ۱۰ گرمی",      slug: "silver-bar-10g",   metalType: MetalType.SILVER, weight: "۱۰ گرم", weightValue: 10, purity: "عیار ۹۹۹", price: 8_500_000,   stock: 20, premiumPercent: 8   },
  { name: "شمش نقره ۵۰ گرمی",           slug: "silver-bar-50g",   metalType: MetalType.SILVER, weight: "۵۰ گرم", weightValue: 50, purity: "عیار ۹۹۹", price: 32_000_000,  stock: 15, premiumPercent: 6   },
];

async function main() {
  console.log("🌱 Starting seed...");

  // ایجاد کاربر ادمین تستی
  const adminPhone = "09000000001";
  const adminPassword = "Admin@12345";
  const existingAdmin = await prisma.user.findUnique({ where: { phone: adminPhone } });
  if (!existingAdmin) {
    await prisma.user.create({
      data: {
        phone: adminPhone,
        firstName: "ادمین",
        lastName: "La Femme",
        passwordHash: await hashPw(adminPassword),
        role: "ADMIN",
        isActive: true,
      },
    });
    console.log(`✅ Admin user created: phone=${adminPhone} | password=${adminPassword}`);
  } else {
    console.log(`ℹ️  Admin user already exists: ${adminPhone}`);
  }

  // ایجاد دسته‌بندی‌ها
  const gold = await prisma.category.upsert({
    where: { slug: "gold-bars" },
    update: {},
    create: { name: "شمش طلا", slug: "gold-bars", sortOrder: 1 },
  });
  const silver = await prisma.category.upsert({
    where: { slug: "silver-bars" },
    update: {},
    create: { name: "شمش نقره", slug: "silver-bars", sortOrder: 2 },
  });

  // ایجاد محصولات
  for (const item of catalog) {
    const product = await prisma.product.upsert({
      where: { slug: item.slug },
      update: { stock: item.stock, price: item.price, premiumPercent: item.premiumPercent },
      create: {
        ...item,
        categoryId: item.metalType === MetalType.GOLD ? gold.id : silver.id,
        description: `${item.name} با گواهی اصالت و بسته‌بندی امن La Femme.`,
        certificate: "گواهی اصالت La Femme",
        brand: "La Femme",
        image: "/assets/images/hero-gold-bar.png",
        status: ProductStatus.ACTIVE,
        isFeatured: true,
      },
    });

    await prisma.inventory.upsert({
      where: { productId: product.id },
      update: { quantity: item.stock },
      create: { productId: product.id, quantity: item.stock, lowStockAt: 3 },
    });

    await prisma.productImage.upsert({
      where: { id: `${product.id}-primary` },
      update: {},
      create: {
        id: `${product.id}-primary`,
        productId: product.id,
        url: "/assets/images/hero-gold-bar.png",
        altText: item.name,
        isPrimary: true,
      },
    });

    console.log(`✅ Product: ${item.name}`);
  }

  console.log("✅ Seed completed successfully.");
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
