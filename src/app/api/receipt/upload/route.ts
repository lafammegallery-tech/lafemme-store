import { NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import { join } from "path";
import { getPrisma } from "@/backend/database/prisma";

/**
 * بارگذاری رسید کارت‌به‌کارت توسط مشتری. نیازی به ورود ندارد چون مهمان‌ها هم
 * سفارش می‌دهند؛ اعتبارسنجی با شماره سفارش یکتا انجام می‌شود.
 */
export async function POST(request: Request) {
  const formData = await request.formData();
  const orderNumber = String(formData.get("orderNumber") ?? "").trim();
  const file = formData.get("file") as File | null;

  if (!orderNumber) return NextResponse.json({ error: "شماره سفارش نامعتبر است." }, { status: 400 });
  if (!file) return NextResponse.json({ error: "فایلی انتخاب نشده است." }, { status: 400 });

  const allowedTypes = ["image/jpeg", "image/png", "image/webp"];
  if (!allowedTypes.includes(file.type)) {
    return NextResponse.json({ error: "فرمت تصویر مجاز نیست. از JPG، PNG یا WebP استفاده کنید." }, { status: 400 });
  }
  const MAX_SIZE = 5 * 1024 * 1024;
  if (file.size > MAX_SIZE) {
    return NextResponse.json({ error: "حجم فایل نباید از ۵ مگابایت بیشتر باشد." }, { status: 400 });
  }

  const prisma = getPrisma();
  const order = await prisma.order.findUnique({ where: { orderNumber }, include: { receipts: true } });
  if (!order) return NextResponse.json({ error: "سفارش پیدا نشد." }, { status: 404 });

  // اگر رسید تأییدشده‌ای وجود دارد، بارگذاری مجدد لازم نیست.
  if (order.receipts.some((r) => r.status === "APPROVED")) {
    return NextResponse.json({ error: "این سفارش قبلاً تأیید شده است." }, { status: 400 });
  }

  const ext = file.name.split(".").pop()?.toLowerCase() ?? "jpg";
  const filename = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
  const uploadDir = join(process.cwd(), "public", "uploads", "receipts");
  await mkdir(uploadDir, { recursive: true });
  const bytes = await file.arrayBuffer();
  await writeFile(join(uploadDir, filename), Buffer.from(bytes));
  const url = `/uploads/receipts/${filename}`;

  await prisma.$transaction(async (tx) => {
    await tx.paymentReceipt.create({ data: { orderId: order.id, imageUrl: url, status: "PENDING" } });
    const payment = await tx.payment.findFirst({ where: { orderId: order.id }, orderBy: { createdAt: "desc" } });
    if (payment && payment.status === "PENDING") {
      await tx.payment.update({ where: { id: payment.id }, data: { status: "PROCESSING" } });
    }
  });

  return NextResponse.json({ url });
}
