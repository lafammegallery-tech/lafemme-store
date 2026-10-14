import { NextResponse } from "next/server";
import { mkdir, writeFile, unlink } from "node:fs/promises";
import { join } from "node:path";
import { getPrisma } from "@/backend/database/prisma";
import { canAccessOrder } from "@/backend/auth/order-access";
import { validateImage } from "@/backend/security/image-upload";
import { assertRateLimit } from "@/backend/security/rate-limit";

export async function POST(request: Request) {
  if (request.headers.get("origin") !== new URL(request.url).origin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  if (Number(request.headers.get("content-length")) > 6 * 1024 * 1024) return NextResponse.json({ error: "File too large" }, { status: 413 });
  try {
    const form = await request.formData();
    const orderNumber = String(form.get("orderNumber") ?? "").slice(0, 100);
    const prisma = getPrisma();
    const order = await prisma.order.findUnique({ where: { orderNumber }, include: { payments: true } });
    if (!order || !(await canAccessOrder(order))) return NextResponse.json({ error: "سفارش پیدا نشد." }, { status: 404 });
    assertRateLimit(`receipt:${order.id}`, 5, 3600_000);
    if (order.status !== "PENDING" || !order.payments.some((p) => p.method === "CARD_TO_CARD")) throw new Error("سفارش قابل ارسال رسید نیست.");
    const { bytes, filename } = await validateImage(form.get("file"));
    const dir = join(process.cwd(), "storage", "receipts");
    await mkdir(dir, { recursive: true });
    const path = join(dir, filename);
    await writeFile(path, bytes, { flag: "wx", mode: 0o600 });
    const url = `/uploads/receipts/${filename}`;
    try {
      await prisma.$transaction(async (tx) => {
        const current = await tx.order.findUniqueOrThrow({ where: { id: order.id }, include: { receipts: true } });
        if (current.status !== "PENDING" || current.receipts.some((r) => r.status === "PENDING" || r.status === "APPROVED")) throw new Error("یک رسید در انتظار بررسی دارید یا سفارش بسته شده است.");
        await tx.paymentReceipt.create({ data: { orderId: order.id, imageUrl: url } });
        await tx.payment.updateMany({ where: { orderId: order.id, method: "CARD_TO_CARD", status: "PENDING" }, data: { status: "PROCESSING" } });
      }, { isolationLevel: "Serializable" });
    } catch (error) { await unlink(path); throw error; }
    return NextResponse.json({ url });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "ارسال رسید ناموفق بود." }, { status: 400 });
  }
}
