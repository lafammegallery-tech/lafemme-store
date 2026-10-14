import { NextResponse } from "next/server";
import { getMarketQuotes, persistMarketQuotes } from "@/backend/services/market-price.service";

export const revalidate = 300;

export async function GET() {
  const quotes = await getMarketQuotes();
  return NextResponse.json(quotes, { headers: { "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600" } });
}

export async function POST(request: Request) {
  const secret = process.env.MARKET_SYNC_SECRET;
  const { getSession } = await import("@/backend/auth/session");
  const session = await getSession();
  if (!(secret && request.headers.get("authorization") === `Bearer ${secret}`) && session?.role !== "ADMIN" && session?.role !== "STAFF") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const result = await persistMarketQuotes();
  return NextResponse.json(result);
}
