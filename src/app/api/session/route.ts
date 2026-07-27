import { NextResponse } from "next/server";
import { getSession } from "@/backend/auth/session";

/** وضعیت ورود کاربر برای مصرف کلاینت — بدون نیاز به رندر پویا کل صفحه. */
export async function GET() {
  const session = await getSession();
  return NextResponse.json(
    { loggedIn: Boolean(session), role: session?.role ?? null },
    { headers: { "Cache-Control": "no-store" } },
  );
}
