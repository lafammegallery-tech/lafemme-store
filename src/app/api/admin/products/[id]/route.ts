import { NextResponse } from "next/server";
import { requireAdminApi } from "@/backend/auth/api-guard";
import { getPrisma } from "@/backend/database/prisma";
import { writeAudit } from "@/backend/services/audit.service";
import { text, positiveInt } from "@/backend/security/validation";

export const dynamic = "force-dynamic";

type Params = { params: Promise<{ id: string }> };

export async function GET(_request: Request, { params }: Params) {
  const auth = await requireAdminApi();
  if (auth instanceof NextResponse) return auth;

  const { id } = await params;
  const product = await getPrisma().product.findFirst({
    where: { id, deletedAt: null },
    include: { category: true, inventory: true },
  });
  if (!product) return NextResponse.json({ error: "محصول پیدا نشد." }, { status: 404 });
  return NextResponse.json({ product });
}

export async function PATCH(request: Request, { params }: Params) {
  const auth = await requireAdminApi();
  if (auth instanceof NextResponse) return auth;

  const { id } = await params;
  const body = (await request.json().catch(() => null)) as Record<string, unknown> | null;
  if (!body) return NextResponse.json({ error: "بدنه درخواست JSON معتبر نیست." }, { status: 400 });

  const prisma = getPrisma();
  const old = await prisma.product.findUnique({ where: { id } });
  if (!old) return NextResponse.json({ error: "محصول پیدا نشد." }, { status: 404 });

  const name = body.name !== undefined ? text(body.name as string, 160) : old.name;
  const price = body.price !== undefined ? String(Math.max(0, Number(body.price))) : String(old.price);
  const stock = body.stock !== undefined ? positiveInt(String(body.stock), 1_000_000) : old.stock;

  const [product] = await prisma.$transaction([
    prisma.product.update({
      where: { id },
      data: {
        name,
        price,
        stock,
        sku: body.sku !== undefined ? text(body.sku as string, 80) || null : undefined,
        weight: body.weight !== undefined ? text(body.weight as string, 50) || null : undefined,
        purity: body.purity !== undefined ? text(body.purity as string, 50) || null : undefined,
        shortDescription:
          body.shortDescription !== undefined ? text(body.shortDescription as string, 300) || null : undefined,
        status: body.status !== undefined ? (text(body.status as string, 20) as never) : undefined,
      },
    }),
    prisma.inventory.upsert({
      where: { productId: id },
      create: { productId: id, quantity: stock, lowStockAt: 5 },
      update: { quantity: stock },
    }),
  ]);

  await writeAudit({
    actorId: auth.userId,
    action: "PRODUCT_UPDATE",
    entityType: "Product",
    entityId: id,
    oldData: { name: old.name, price: String(old.price) },
    newData: { name, price, stock },
  });

  return NextResponse.json({ product });
}

export async function DELETE(_request: Request, { params }: Params) {
  const auth = await requireAdminApi();
  if (auth instanceof NextResponse) return auth;

  const { id } = await params;
  const prisma = getPrisma();
  const old = await prisma.product.findUnique({ where: { id } });
  if (!old) return NextResponse.json({ error: "محصول پیدا نشد." }, { status: 404 });

  await prisma.product.update({ where: { id }, data: { status: "ARCHIVED", deletedAt: new Date() } });
  await writeAudit({ actorId: auth.userId, action: "PRODUCT_ARCHIVE", entityType: "Product", entityId: id });

  return NextResponse.json({ ok: true });
}
