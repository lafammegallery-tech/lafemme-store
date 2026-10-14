import "server-only";
import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { getSession, secretKey, secureCookies } from "./session";

export async function grantGuestOrderAccess(orderId: string) {
  const token = await new SignJWT({ orderId }).setProtectedHeader({ alg: "HS256" })
    .setAudience("guest-order").setIssuedAt().setExpirationTime("7d").sign(secretKey());
  (await cookies()).set(`lf_order_${orderId}`, token, { httpOnly: true, sameSite: "lax", secure: secureCookies(), path: "/", maxAge: 7 * 86400 });
}

export async function canAccessOrder(order: { id: string; userId: string | null }, allowStaff = false) {
  const session = await getSession();
  if (session && (session.userId === order.userId || (allowStaff && ["ADMIN", "STAFF"].includes(session.role)))) return true;
  if (order.userId) return false;
  const token = (await cookies()).get(`lf_order_${order.id}`)?.value;
  if (!token) return false;
  try {
    const { payload } = await jwtVerify(token, secretKey(), { algorithms: ["HS256"], audience: "guest-order" });
    return payload.orderId === order.id;
  } catch { return false; }
}
