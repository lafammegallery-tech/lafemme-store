import type { Metadata } from "next";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { Container } from "@/components/ui";
import Link from "next/link";

export const metadata: Metadata = {
  title: "جزئیات محصول | La Femme",
  robots: { index: false, follow: true },
};

/** مسیر /product به /products هدایت می‌شود. */
export default function ProductRedirectPage() {
  return (
    <>
      <SiteHeader />
      <main dir="rtl" className="page-hero">
        <Container>
          <h1>در حال انتقال...</h1>
          <p>به صفحه محصولات منتقل می‌شوید.</p>
          <Link href="/products" className="btn btn-primary">
            رفتن به محصولات
          </Link>
        </Container>
      </main>
      <SiteFooter />
    </>
  );
}
