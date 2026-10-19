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
  // Resolve metadata before streaming so missing products can return a real 404
  // and all crawlers receive the same complete metadata in the initial HTML.
  htmlLimitedBots: /.*/,
  async redirects() { return [{ source: "/product", destination: "/products", permanent: true }]; },
  images: {
    formats: ["image/webp"],
    // Only public catalog images may enter the shared image optimizer cache.
    // Receipts remain authenticated, unoptimized and private/no-store.
    localPatterns: [
      { pathname: "/assets/images/**", search: "" },
      { pathname: "/uploads/products/**", search: "" },
    ],
  },
  async headers() { return [{ source: "/:path*", headers: securityHeaders }]; },
};
export default nextConfig;
