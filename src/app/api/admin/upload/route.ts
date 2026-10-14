import { NextResponse } from "next/server";
import { requireAdminApi } from "@/backend/auth/api-guard";
import { mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { validateImage } from "@/backend/security/image-upload";
import { assertRateLimit } from "@/backend/security/rate-limit";

export async function POST(request: Request) {
  const auth = await requireAdminApi();
  if (auth instanceof NextResponse) return auth;
  if (request.headers.get("origin") !== new URL(request.url).origin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  if (Number(request.headers.get("content-length")) > 6 * 1024 * 1024) return NextResponse.json({ error: "File too large" }, { status: 413 });
  try {
    assertRateLimit(`product-upload:${auth.userId}`, 30);
    const form = await request.formData();
    const { filename, bytes } = await validateImage(form.get("file"));
    const dir = join(process.cwd(), "storage", "products");
    await mkdir(dir, { recursive: true });
    await writeFile(join(dir, filename), bytes, { flag: "wx" });
    return NextResponse.json({ url: `/uploads/products/${filename}` });
  } catch (error) { return NextResponse.json({ error: error instanceof Error ? error.message : "Upload failed" }, { status: 400 }); }
}
