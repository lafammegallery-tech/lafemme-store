import { NextResponse } from "next/server";
import { requireAdminApi } from "@/backend/auth/api-guard";
import { reviewPaymentReceipt } from "@/backend/services/receipt-review.service";
import { text } from "@/backend/security/validation";
import { isAllowedRequestOrigin } from "@/backend/security/request-origin";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  if (!isAllowedRequestOrigin(request.headers)) return NextResponse.json({ error: "درخواست از مبدأ مجاز نیست." }, { status: 403 });
  const session = await requireAdminApi();
  if (session instanceof NextResponse) return session;
  try {
    const body = await request.json().catch(() => null) as Record<string, unknown> | null;
    if (!body || typeof body !== "object" || Array.isArray(body)) return NextResponse.json({ error: "بدنهٔ درخواست معتبر نیست." }, { status: 400 });
    if (typeof body.id !== "string" || typeof body.decision !== "string" || (body.note !== undefined && typeof body.note !== "string")) return NextResponse.json({ error: "درخواست بررسی معتبر نیست." }, { status: 400 });
    const id = text(body.id as string, 100);
    const decision = body.decision;
    if (!id || (decision !== "approve" && decision !== "reject")) return NextResponse.json({ error: "درخواست بررسی معتبر نیست." }, { status: 400 });
    const note = text(body.note as string, 500);
    if (decision === "reject" && !note) return NextResponse.json({ error: "دلیل رد را بنویسید تا مشتری بتواند اصلاح کند." }, { status: 400 });
    const orderId = await reviewPaymentReceipt(id, decision === "approve", session.userId, note || null);
    return NextResponse.json({ message: decision === "approve" ? "تمام رسیدهای این مرحله تأیید شدند." : "مجموعه رسیدها رد شد؛ مشتری می‌تواند مجموعهٔ اصلاح‌شده ارسال کند.", orderId });
  } catch (error) { return NextResponse.json({ error: error instanceof Error ? error.message : "بررسی انجام نشد." }, { status: 400 }); }
}
