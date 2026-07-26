import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import type { UserRole } from "@/generated/prisma/client";

const COOKIE_NAME = "lafemme_session";
const MAX_AGE = 60 * 60 * 24 * 14;
type SessionPayload = { userId: string; role: UserRole; exp: number };
function secret() { return process.env.AUTH_SECRET || "development-only-change-me"; }
function sign(value: string) { return createHmac("sha256", secret()).update(value).digest("base64url"); }
function encode(payload: SessionPayload) { const body = Buffer.from(JSON.stringify(payload)).toString("base64url"); return `${body}.${sign(body)}`; }
function decode(token?: string): SessionPayload | null {
  if (!token) return null;
  const [body, signature] = token.split(".");
  if (!body || !signature) return null;
  const expected = Buffer.from(sign(body)); const actual = Buffer.from(signature);
  if (expected.length !== actual.length || !timingSafeEqual(expected, actual)) return null;
  try { const payload = JSON.parse(Buffer.from(body, "base64url").toString()) as SessionPayload; return payload.exp > Date.now() ? payload : null; } catch { return null; }
}
export async function createSession(userId: string, role: UserRole) {
  const store = await cookies();
  store.set(COOKIE_NAME, encode({ userId, role, exp: Date.now() + MAX_AGE * 1000 }), { httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production", path: "/", maxAge: MAX_AGE });
}
export async function destroySession() { const store = await cookies(); store.delete(COOKIE_NAME); }
export async function getSession() { const store = await cookies(); return decode(store.get(COOKIE_NAME)?.value); }
export async function requireSession() { const session = await getSession(); if (!session) redirect("/login?next=/dashboard"); return session; }
export async function requireAdmin() { const session = await requireSession(); if (session.role !== "ADMIN" && session.role !== "STAFF") redirect("/dashboard"); return session; }
