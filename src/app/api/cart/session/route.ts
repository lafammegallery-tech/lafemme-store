import { cookies } from "next/headers";
import { randomUUID } from "crypto";
import { NextResponse } from "next/server";

const CART_COOKIE = "lafemme_cart";

export async function GET() {
  const cookieStore = await cookies();

  let sessionId = cookieStore.get(CART_COOKIE)?.value;

  if (!sessionId) {
    sessionId = randomUUID();

    cookieStore.set(CART_COOKIE, sessionId, {
      httpOnly: true,
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 30,
    });
  }

  return NextResponse.json({ sessionId });
}
