import { NextResponse } from "next/server";
import { readFile } from "fs/promises";
import { join } from "path";
import { getPrisma } from "@/backend/database/prisma";
import { canAccessOrder } from "@/backend/auth/order-access";

const MIME: Record<string, string> = {
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  png: "image/png",
  webp: "image/webp",
  gif: "image/gif",
  avif: "image/avif",
};

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path } = await params;

  // Block path traversal
  if (path.length !== 2 || !["products", "receipts"].includes(path[0]) || path.some((segment) => !/^[a-zA-Z0-9._-]+$/.test(segment) || segment === "..")) {
    return new NextResponse(null, { status: 400 });
  }

  const filePath = join(process.cwd(), "storage", ...path);
  const privateFile = path[0] === "receipts";
  if (privateFile) {
    const receipt = await getPrisma().paymentReceipt.findFirst({ where: { imageUrl: `/uploads/${path.join("/")}` }, include: { order: true } });
    if (!receipt || !(await canAccessOrder(receipt.order, true))) return new NextResponse(null, { status: 404 });
  }

  try {
    const data = await readFile(filePath);
    const ext = path[path.length - 1].split(".").pop()?.toLowerCase() ?? "";
    const contentType = MIME[ext] ?? "application/octet-stream";

    return new NextResponse(new Uint8Array(data), {
      headers: {
        "Content-Type": contentType,
        "Cache-Control": privateFile ? "private, no-store" : "public, max-age=31536000, immutable",
      },
    });
  } catch {
    return new NextResponse(null, { status: 404 });
  }
}
