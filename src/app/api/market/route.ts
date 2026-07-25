import { NextResponse } from "next/server";
import { getMarketQuotes, persistMarketQuotes } from "@/backend/services/market-price.service";

export const revalidate = 300;

export async function GET() {
  const quotes = await getMarketQuotes();
  return NextResponse.json(quotes, { headers: { "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600" } });
}

export async function POST(request: Request) {
  const secret = process.env.MARKET_SYNC_SECRET;
  if (secret && request.headers.get("authorization") !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const result = await persistMarketQuotes();
  return NextResponse.json(result);
}
