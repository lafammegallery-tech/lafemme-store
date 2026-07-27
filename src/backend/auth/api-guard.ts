import { NextResponse } from "next/server";
import { getSession, type Session } from "./session";

/** بررسی دسترسی ادمین برای Route Handlerها — به‌جای redirect صفحه، پاسخ JSON مناسب برمی‌گرداند. */
export async function requireAdminApi(): Promise<Session | NextResponse> {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (session.role !== "ADMIN" && session.role !== "STAFF") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  return session;
}
