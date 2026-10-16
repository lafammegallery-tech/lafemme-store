import { NextResponse } from "next/server";
import { mkdir, writeFile, unlink } from "node:fs/promises";
import { join } from "node:path";
import { getPrisma } from "@/backend/database/prisma";
import { canAccessOrder } from "@/backend/auth/order-access";
import { validateImage } from "@/backend/security/image-upload";
import { assertRateLimit } from "@/backend/security/rate-limit";
import { isAllowedRequestOrigin } from "@/backend/security/request-origin";
import { submitReceiptBundle } from "@/backend/services/staged-payment.service";
import { MAX_RECEIPT_BYTES, MAX_RECEIPT_FILES } from "@/lib/staged-payment";
import type { PaymentStage } from "@/generated/prisma/enums";

export async function POST(request: Request) {
  if (!isAllowedRequestOrigin(request.headers)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  if (Number(request.headers.get("content-length")) > MAX_RECEIPT_BYTES + 1024 * 1024) return NextResponse.json({ error: "حجم کل تصاویر باید حداکثر ۳۰ مگابایت باشد." }, { status: 413 });
  const paths: string[] = [];
  try {
    const form = await request.formData();
    const orderNumber = String(form.get("orderNumber") ?? "").slice(0, 100);
    const order = await getPrisma().order.findUnique({ where: { orderNumber } });
    if (!order || !(await canAccessOrder(order))) return NextResponse.json({ error: "سفارش پیدا نشد." }, { status: 404 });
    assertRateLimit(`receipt:${order.id}`, 10, 3600_000);
    const stage = String(form.get("stage") ?? "FULL") as PaymentStage;
    if (!["DEPOSIT", "BALANCE", "FULL"].includes(stage)) throw new Error("مرحله معتبر نیست.");
    const revision = Number(form.get("revision"));
    if (!form.has("revision") || !Number.isSafeInteger(revision) || revision < 0) throw new Error("صفحه را تازه کنید.");
    const files = form.getAll("files");
    if (!files.length && form.get("file")) files.push(form.get("file")!);
    if (!files.length || files.length > MAX_RECEIPT_FILES) throw new Error("بین ۱ تا ۱۰ تصویر انتخاب کنید.");
    if (files.reduce((sum, f) => sum + (f instanceof File ? f.size : MAX_RECEIPT_BYTES + 1), 0) > MAX_RECEIPT_BYTES) throw new Error("مجموع تصاویر نباید بیشتر از ۳۰ مگابایت باشد.");
    // Validate every image before writing any files. Commit the entire bundle atomically.
    const images = [];
    for (const file of files) images.push(await validateImage(file));
    const dir = join(process.cwd(), "storage", "receipts");
    await mkdir(dir, { recursive: true });
    for (const image of images) {
      const path = join(dir, image.filename);
      await writeFile(path, image.bytes, { flag: "wx", mode: 0o600 });
      paths.push(path);
    }
    const urls = images.map(image => `/uploads/receipts/${image.filename}`);
    await submitReceiptBundle(order.id, stage, revision, urls);
    return NextResponse.json({ urls });
  } catch (error) {
    await Promise.allSettled(paths.map(path => unlink(path)));
    return NextResponse.json({ error: error instanceof Error ? error.message : "ارسال رسید ناموفق بود." }, { status: 400 });
  }
}
