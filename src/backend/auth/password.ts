import { randomBytes, scrypt, timingSafeEqual } from "node:crypto";
import { promisify } from "node:util";

const scryptAsync = promisify(scrypt);
const KEY_LENGTH = 64;

/** این تابع رمز عبور را با scrypt هش می‌کند — به صورت async تا event loop مسدود نشود. */
export async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16).toString("hex");
  const hash = (await scryptAsync(password, salt, KEY_LENGTH) as Buffer).toString("hex");
  return `scrypt:${salt}:${hash}`;
}

/** این تابع رمز عبور را با هش ذخیره‌شده مقایسه می‌کند. */
export async function verifyPassword(password: string, stored: string): Promise<boolean> {
  const [algorithm, salt, hash] = stored.split(":");
  if (algorithm !== "scrypt" || !salt || !hash) return false;
  const computed = (await scryptAsync(password, salt, KEY_LENGTH) as Buffer);
  const expected = Buffer.from(hash, "hex");
  return computed.length === expected.length && timingSafeEqual(computed, expected);
}
