import { NextResponse } from "next/server";
import { requireAdminApi } from "@/backend/auth/api-guard";
import { getPrisma } from "@/backend/database/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  const auth = await requireAdminApi();
  if (auth instanceof NextResponse) return auth;

  const orders = await getPrisma().order.findMany({
    where: { deletedAt: null },
    include: { payments: true, shipment: true },
    orderBy: { createdAt: "desc" },
    take: 100,
  });
  return NextResponse.json({ orders });
}
