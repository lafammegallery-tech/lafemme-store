const buckets = new Map<string, { count: number; resetAt: number }>();
export function assertRateLimit(key: string, limit = 10, windowMs = 60_000) {
  const now = Date.now();
  if (buckets.size >= 10_000) {
    for (const [bucketKey, bucket] of buckets) if (bucket.resetAt <= now) buckets.delete(bucketKey);
    if (buckets.size >= 10_000 && !buckets.has(key)) throw new Error("درخواست بیش از حد مجاز؛ کمی بعد تلاش کنید.");
  }
  const current = buckets.get(key);
  if (!current || current.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return;
  }
  if (current.count >= limit) throw new Error("تعداد درخواست‌ها بیش از حد مجاز است. کمی بعد دوباره تلاش کنید.");
  current.count += 1;
}
