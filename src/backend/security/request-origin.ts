/** Use the configured public origin, not Next.js's internal container URL. */
export function isAllowedRequestOrigin(headers: Pick<Headers, "get">, siteUrl = process.env.NEXT_PUBLIC_SITE_URL): boolean {
  const value = headers.get("origin");
  if (!value) return false;
  try {
    const origin = new URL(value);
    if (!["http:", "https:"].includes(origin.protocol) || value !== origin.origin) return false;
    if (siteUrl) return origin.origin === new URL(siteUrl).origin;
    // Without a configured origin, use the actual Host header, never arbitrary forwarded hosts.
    return origin.host === headers.get("host");
  } catch {
    return false;
  }
}
