import { test } from "node:test";
import assert from "node:assert/strict";
import { validateImage } from "../src/backend/security/image-upload";
import { positiveInt } from "../src/backend/security/validation";
import { assertRateLimit } from "../src/backend/security/rate-limit";
import sharp from "sharp";

test("quantity rejects invalid, negative and fractional inputs", () => {
  for (const value of ["-1", "1.2", "NaN", "100"]) assert.throws(() => positiveInt(value, 99));
  assert.equal(positiveInt("3", 99), 3);
});
test("image validation rejects spoofed MIME types", async () => {
  await assert.rejects(validateImage(new File(["<script>bad</script>"], "x.jpg", { type: "image/jpeg" })));
  await assert.rejects(validateImage("not a file"));
});
test("image extensions are generated from bytes, not untrusted names", async () => {
  const data = await sharp({ create: { width: 2, height: 2, channels: 3, background: "white" } }).png().toBuffer();
  const file = new File([new Uint8Array(data)], "evil.html", { type: "text/html" });
  const result = await validateImage(file);
  assert.match(result.filename, /^[a-f0-9-]+\.webp$/);
  assert.equal((await sharp(result.bytes).metadata()).format, "webp");
});
test("truncated image with a valid signature is rejected", async () => {
  await assert.rejects(validateImage(new File([new Uint8Array([255, 216, 255, 224])], "x.jpg")));
});
test("rate limit blocks requests above threshold", () => {
  const key = `test:${crypto.randomUUID()}`;
  assertRateLimit(key, 2); assertRateLimit(key, 2);
  assert.throws(() => assertRateLimit(key, 2));
});
test("JSON-LD escaping removes script termination", () => {
  const encoded = JSON.stringify({ name: "</script><script>bad</script>" }).replace(/</g, "\\u003c");
  assert.ok(!encoded.includes("</script>"));
  assert.equal(JSON.parse(encoded).name, "</script><script>bad</script>");
});
