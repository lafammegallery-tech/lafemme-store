import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import type { UserRole } from "@/generated/prisma/client";

const COOKIE_NAME = "lafemme_session";
/**
 * کوکی غیر-httpOnly که فقط نقش کاربر را نگه می‌دارد — هیچ اطلاعات حساسی ندارد و
 * صرفاً برای رندر شرطی هدر در سمت کلاینت استفاده می‌شود (بدون فراخوانی cookies() در
 * کامپوننت‌های سروری، که هر صفحه را وادار به رندر پویا می‌کند).
 */
const ROLE_HINT_COOKIE = "lf_role";
const MAX_AGE_SECONDS = 60 * 60 * 24 * 14;

export interface Session {
  userId: string;
  role: UserRole;
}

function secretKey() {
  const s = process.env.AUTH_SECRET;
  if (!s) {
    // در محیط production بدون AUTH_SECRET سرور باید اجرا نشود
    if (process.env.NODE_ENV === "production") throw new Error("AUTH_SECRET must be set in production.");
    return new TextEncoder().encode("development-only-change-me");
  }
  return new TextEncoder().encode(s);
}

/** ساخت نشست کاربر به‌صورت JWT استاندارد (HS256) و ذخیره آن در کوکی httpOnly. */
export async function createSession(userId: string, role: UserRole) {
  const token = await new SignJWT({ userId, role })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${MAX_AGE_SECONDS}s`)
    .sign(secretKey());

  const store = await cookies();
  const cookieOptions = {
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: MAX_AGE_SECONDS,
  };
  store.set(COOKIE_NAME, token, { ...cookieOptions, httpOnly: true });
  store.set(ROLE_HINT_COOKIE, role, { ...cookieOptions, httpOnly: false });
}

export async function destroySession() {
  const store = await cookies();
  store.delete(COOKIE_NAME);
  store.delete(ROLE_HINT_COOKIE);
}

export async function getSession(): Promise<Session | null> {
  const store = await cookies();
  const token = store.get(COOKIE_NAME)?.value;
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, secretKey());
    const { userId, role } = payload as { userId?: unknown; role?: unknown };
    if (typeof userId !== "string" || typeof role !== "string") return null;
    return { userId, role: role as UserRole };
  } catch {
    // امضای نامعتبر یا منقضی‌شده — jwtVerify در هر دو حالت خطا می‌دهد
    return null;
  }
}

export async function requireSession(next: string = "/dashboard") {
  const session = await getSession();
  if (!session) redirect(`/login?next=${encodeURIComponent(next)}`);
  return session;
}

export async function requireAdmin(next: string = "/admin") {
  const session = await requireSession(next);
  if (session.role !== "ADMIN" && session.role !== "STAFF") redirect("/dashboard");
  return session;
}
