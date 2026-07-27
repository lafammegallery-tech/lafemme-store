import { NextResponse } from "next/server";
import { requireAdminApi } from "@/backend/auth/api-guard";
import { getPrisma } from "@/backend/database/prisma";
import { writeAudit } from "@/backend/services/audit.service";
import type { UserRole } from "@/generated/prisma/enums";

export const dynamic = "force-dynamic";

type Params = { params: Promise<{ id: string }> };

/** ارتقا یا تنزل نقش کاربر بین مشتری و مدیر — نسخه API از toggleUserAdminAction. */
export async function PATCH(_request: Request, { params }: Params) {
  const auth = await requireAdminApi();
  if (auth instanceof NextResponse) return auth;

  const { id } = await params;
  if (id === auth.userId) {
    return NextResponse.json({ error: "امکان تغییر نقش حساب خودتان وجود ندارد." }, { status: 400 });
  }

  const prisma = getPrisma();
  const target = await prisma.user.findFirst({ where: { id, deletedAt: null } });
  if (!target) return NextResponse.json({ error: "کاربر پیدا نشد." }, { status: 404 });

  const nextRole: UserRole = target.role === "ADMIN" ? "CUSTOMER" : "ADMIN";
  const user = await prisma.user.update({
    where: { id },
    data: { role: nextRole },
    select: { id: true, phone: true, role: true },
  });

  await writeAudit({
    actorId: auth.userId,
    action: "USER_ROLE_TOGGLE",
    entityType: "User",
    entityId: id,
    oldData: { role: target.role },
    newData: { role: nextRole },
  });

  return NextResponse.json({ user });
}
