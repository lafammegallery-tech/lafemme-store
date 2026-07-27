import { NextResponse } from "next/server";
import { requireAdminApi } from "@/backend/auth/api-guard";
import { getPrisma } from "@/backend/database/prisma";
import { writeAudit } from "@/backend/services/audit.service";
import { text, positiveInt } from "@/backend/security/validation";
import type { MetalType } from "@/generated/prisma/enums";

export const dynamic = "force-dynamic";

/** فهرست محصولات برای مصرف API — همان داده‌ای که پنل مدیریت نمایش می‌دهد. */
export async function GET() {
  const auth = await requireAdminApi();
  if (auth instanceof NextResponse) return auth;

  const products = await getPrisma().product.findMany({
    where: { deletedAt: null },
    include: { category: true, inventory: true },
    orderBy: { updatedAt: "desc" },
  });
  return NextResponse.json({ products });
}

/** ایجاد محصول جدید از طریق API. */
export async function POST(request: Request) {
  const auth = await requireAdminApi();
  if (auth instanceof NextResponse) return auth;

  const body = (await request.json().catch(() => null)) as Record<string, unknown> | null;
  if (!body) return NextResponse.json({ error: "بدنه درخواست JSON معتبر نیست." }, { status: 400 });

  const name = text(body.name as string, 160);
  const slug = text(body.slug as string, 180).toLowerCase().replace(/\s+/g, "-");
  const categoryId = text(body.categoryId as string, 100);
  if (!name || !slug || !categoryId) {
    return NextResponse.json({ error: "نام، اسلاگ و دسته‌بندی الزامی است." }, { status: 400 });
  }

  const price = String(Math.max(0, Number(body.price ?? 0)));
  const stock = positiveInt(String(body.stock ?? 0), 1_000_000);

  const prisma = getPrisma();
  const product = await prisma.product.create({
    data: {
      name,
      slug,
      categoryId,
      sku: text(body.sku as string, 80) || null,
      metalType: (text(body.metalType as string, 20) || "GOLD") as MetalType,
      weight: text(body.weight as string, 50) || null,
      weightValue: Number(body.weightValue ?? 0) || null,
      purity: text(body.purity as string, 50) || null,
      price,
      stock,
      status: "ACTIVE",
      shortDescription: text(body.shortDescription as string, 300) || null,
      inventory: { create: { quantity: stock, lowStockAt: 5 } },
    },
  });

  await writeAudit({
    actorId: auth.userId,
    action: "PRODUCT_CREATE",
    entityType: "Product",
    entityId: product.id,
    newData: { name, slug, stock },
  });

  return NextResponse.json({ product }, { status: 201 });
}
