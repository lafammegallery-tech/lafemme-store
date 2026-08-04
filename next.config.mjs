/** @type {import('next').NextConfig} */
const securityHeaders = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), payment=(self)" },
  { key: "Cross-Origin-Opener-Policy", value: "same-origin" },
  { key: "X-DNS-Prefetch-Control", value: "on" },
];
const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  compress: true,
  images: { unoptimized: true },
  async headers() { return [{ source: "/:path*", headers: securityHeaders }]; },
};
export default nextConfig;
