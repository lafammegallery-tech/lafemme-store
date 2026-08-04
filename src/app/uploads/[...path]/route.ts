import { NextResponse } from "next/server";
import { readFile } from "fs/promises";
import { join } from "path";

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
  if (path.some((segment) => segment === ".." || segment.includes("\0"))) {
    return new NextResponse(null, { status: 400 });
  }

  const filePath = join(process.cwd(), "public", "uploads", ...path);

  try {
    const data = await readFile(filePath);
    const ext = path[path.length - 1].split(".").pop()?.toLowerCase() ?? "";
    const contentType = MIME[ext] ?? "application/octet-stream";

    return new NextResponse(new Uint8Array(data), {
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch {
    return new NextResponse(null, { status: 404 });
  }
}
