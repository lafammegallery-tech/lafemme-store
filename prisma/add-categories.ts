import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL! }),
});

const categories = [
  { name: "شمش طلا", slug: "gold-bars", description: "شمش‌های طلا با عیارهای مختلف", sortOrder: 1 },
  { name: "شمش نقره", slug: "silver-bars", description: "شمش‌های نقره خالص ۹۹۹", sortOrder: 2 },
  { name: "سکه طلا", slug: "gold-coins", description: "سکه‌های طلا ضرابخانه‌ای و بهار آزادی", sortOrder: 3 },
  { name: "گردنبند طلا", slug: "gold-necklaces", description: "گردنبندهای طلا با طرح‌های متنوع", sortOrder: 4 },
  { name: "دستبند طلا", slug: "gold-bracelets", description: "دستبندهای طلا با عیار ۱۸", sortOrder: 5 },
  { name: "انگشتر طلا", slug: "gold-rings", description: "انگشترهای طلا و حلقه", sortOrder: 6 },
  { name: "گوشواره طلا", slug: "gold-earrings", description: "گوشواره‌های طلا با طرح‌های لوکس", sortOrder: 7 },
  { name: "جواهرات نقره", slug: "silver-jewelry", description: "جواهرات نقره و زیورآلات", sortOrder: 8 },
];

async function main() {
  console.log("Adding categories...");
  for (const cat of categories) {
    await prisma.category.upsert({
      where: { slug: cat.slug },
      update: { name: cat.name, description: cat.description, sortOrder: cat.sortOrder },
      create: { ...cat, isActive: true },
    });
    console.log(`✅ ${cat.name}`);
  }
  console.log("Done.");
  await prisma.$disconnect();
}

main().catch(async (e) => {
  console.error(e);
  await prisma.$disconnect();
  process.exit(1);
});
