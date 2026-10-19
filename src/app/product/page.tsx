import type { Metadata } from "next";
import { permanentRedirect } from "next/navigation";

export const metadata: Metadata = {
  title: "جزئیات محصول",
  robots: { index: false, follow: true },
};

/** مسیر /product به /products هدایت می‌شود. */
export default function ProductRedirectPage() {
  permanentRedirect("/products");
}
