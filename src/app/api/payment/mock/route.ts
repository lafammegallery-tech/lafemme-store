import { NextResponse } from "next/server";
export async function GET() {
  return NextResponse.json({ error: "پرداخت آزمایشی غیرفعال است." }, { status: 410 });
}
