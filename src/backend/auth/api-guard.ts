import { NextResponse } from "next/server";
import { getSession, type Session } from "./session";
import { headers } from "next/headers";

/** بررسی دسترسی ادمین برای Route Handlerها — به‌جای redirect صفحه، پاسخ JSON مناسب برمی‌گرداند. */
export async function requireAdminApi(): Promise<Session | NextResponse> {
  const requestHeaders = await headers();
  const origin = requestHeaders.get("origin");
  const host = requestHeaders.get("x-forwarded-host") ?? requestHeaders.get("host");
  if (origin && new URL(origin).host !== host) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (session.role !== "ADMIN" && session.role !== "STAFF") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  return session;
}
