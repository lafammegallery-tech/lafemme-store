import { randomUUID } from "node:crypto";
import sharp from "sharp";

export async function validateImage(file: unknown) {
  if (!(file instanceof File) || file.size === 0 || file.size > 5 * 1024 * 1024) throw new Error("تصویر باید حداکثر ۵ مگابایت باشد.");
  const bytes = Buffer.from(await file.arrayBuffer());
  let ext: string;
  if (bytes.subarray(0, 3).equals(Buffer.from([0xff, 0xd8, 0xff]))) ext = "jpg";
  else if (bytes.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]))) ext = "png";
  else if (bytes.toString("ascii", 0, 4) === "RIFF" && bytes.toString("ascii", 8, 12) === "WEBP") ext = "webp";
  else throw new Error("فقط تصویر JPG، PNG یا WebP معتبر مجاز است.");
  void ext;
  const sanitized = await sharp(bytes, { limitInputPixels: 25_000_000, animated: false }).rotate().webp({ quality: 85 }).toBuffer();
  return { bytes: sanitized, filename: `${randomUUID()}.webp` };
}
