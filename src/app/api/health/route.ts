import { NextResponse } from "next/server";
import { getPrisma } from "@/backend/database/prisma";

export const dynamic = "force-dynamic";
export async function GET() {
  const startedAt = Date.now();
  let database: "up" | "down" = "down";
  try { await getPrisma().$queryRaw`SELECT 1`; database = "up"; } catch { database = "down"; }
  const status = database === "up" ? 200 : 503;
  return NextResponse.json({ status: database === "up" ? "ok" : "degraded", database, service: "lafemme-storefront", timestamp: new Date().toISOString(), responseTimeMs: Date.now() - startedAt }, { status, headers: { "Cache-Control": "no-store" } });
}
