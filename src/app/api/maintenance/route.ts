import { NextResponse } from "next/server";
import { expireUnpaidOrders } from "@/backend/services/order-status.service";
export async function POST(request: Request) {
  const secret = process.env.MARKET_SYNC_SECRET;
  if (!secret || request.headers.get("authorization") !== `Bearer ${secret}`) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  await expireUnpaidOrders();
  return NextResponse.json({ ok: true });
}
