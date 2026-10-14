"use server";
import { getPrisma } from "@/backend/database/prisma";
import { text } from "@/backend/security/validation";
import { assertRateLimit } from "@/backend/security/rate-limit";
import { headers } from "next/headers";
export type ContactState = { error?: string; success?: boolean };
export async function contactAction(_: ContactState, form: FormData): Promise<ContactState> {
  try {
    const requestHeaders = await headers();
    assertRateLimit(`contact:${requestHeaders.get("x-forwarded-for") ?? "unknown"}`, 5, 3600_000);
    const name = text(form.get("name"), 120);
    const email = text(form.get("email"), 200);
    const message = text(form.get("message"), 5000);
    if (!name || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || message.length < 10) return { error: "نام، ایمیل معتبر و پیام حداقل ۱۰ کاراکتری وارد کنید." };
    await getPrisma().contactMessage.create({ data: { name, email, message } });
    return { success: true };
  } catch { return { error: "ارسال پیام ناموفق بود؛ کمی بعد تلاش کنید." }; }
}
