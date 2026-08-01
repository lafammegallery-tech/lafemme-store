import { NextResponse } from "next/server";
import { requireAdmin } from "@/backend/auth/session";
import { writeFile, mkdir } from "fs/promises";
import { join } from "path";

export async function POST(request: Request) {
  try {
    await requireAdmin();
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const formData = await request.formData();
  const file = formData.get("file") as File | null;

  if (!file) {
    return NextResponse.json({ error: "فایلی انتخاب نشده است" }, { status: 400 });
  }

  const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"];
  if (!allowedTypes.includes(file.type)) {
    return NextResponse.json({ error: "فرمت فایل مجاز نیست. لطفاً از JPG، PNG یا WebP استفاده کنید." }, { status: 400 });
  }

  const MAX_SIZE = 5 * 1024 * 1024; // 5MB
  if (file.size > MAX_SIZE) {
    return NextResponse.json({ error: "حجم فایل نباید از ۵ مگابایت بیشتر باشد." }, { status: 400 });
  }

  const ext = file.name.split(".").pop()?.toLowerCase() ?? "jpg";
  const filename = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
  const uploadDir = join(process.cwd(), "public", "uploads", "products");

  await mkdir(uploadDir, { recursive: true });

  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);
  await writeFile(join(uploadDir, filename), buffer);

  return NextResponse.json({ url: `/uploads/products/${filename}` });
}
