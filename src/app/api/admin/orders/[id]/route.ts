import { NextResponse } from "next/server";
import { requireAdminApi } from "@/backend/auth/api-guard";
import { getPrisma } from "@/backend/database/prisma";
import { writeAudit } from "@/backend/services/audit.service";
import { text } from "@/backend/security/validation";
import type { OrderStatus } from "@/generated/prisma/enums";

export const dynamic = "force-dynamic";

type Params = { params: Promise<{ id: string }> };

export async function GET(_request: Request, { params }: Params) {
  const auth = await requireAdminApi();
  if (auth instanceof NextResponse) return auth;

  const { id } = await params;
  const order = await getPrisma().order.findFirst({
    where: { id, deletedAt: null },
    include: { items: true, payments: true, shipment: true, statusHistory: true },
  });
  if (!order) return NextResponse.json({ error: "سفارش پیدا نشد." }, { status: 404 });
  return NextResponse.json({ order });
}

/** به‌روزرسانی وضعیت سفارش — همان منطق toggleOrderStatusAction اما به‌صورت API. */
export async function PATCH(request: Request, { params }: Params) {
  const auth = await requireAdminApi();
  if (auth instanceof NextResponse) return auth;

  const { id } = await params;
  const body = (await request.json().catch(() => null)) as Record<string, unknown> | null;
  if (!body?.status) return NextResponse.json({ error: "وضعیت جدید الزامی است." }, { status: 400 });

  const status = text(body.status as string, 30) as OrderStatus;
  const note = text((body.note as string) ?? "", 500);
  const prisma = getPrisma();

  const old = await prisma.order.findUnique({ where: { id } });
  if (!old) return NextResponse.json({ error: "سفارش پیدا نشد." }, { status: 404 });

  const order = await prisma.order.update({
    where: { id },
    data: {
      status,
      statusHistory: { create: { fromStatus: old.status, toStatus: status, note, actorId: auth.userId } },
    },
  });

  if (status === "CANCELLED") {
    for (const item of await prisma.orderItem.findMany({ where: { orderId: id } })) {
      if (item.productId) {
        await prisma.inventory.updateMany({
          where: { productId: item.productId },
          data: { reserved: { decrement: item.quantity } },
        });
      }
    }
  }

  await writeAudit({
    actorId: auth.userId,
    action: "ORDER_STATUS_UPDATE",
    entityType: "Order",
    entityId: id,
    oldData: { status: old.status },
    newData: { status, note },
  });

  return NextResponse.json({ order });
}
