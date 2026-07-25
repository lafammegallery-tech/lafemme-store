import { headers } from "next/headers";
import { getPrisma } from "@/backend/database/prisma";
export async function writeAudit(input: { actorId?: string; action: string; entityType: string; entityId?: string; oldData?: object; newData?: object }) {
  const h = await headers();
  await getPrisma().auditLog.create({ data: { ...input, ipAddress: h.get("x-forwarded-for")?.split(",")[0]?.trim(), userAgent: h.get("user-agent"), oldData: input.oldData, newData: input.newData } });
}
