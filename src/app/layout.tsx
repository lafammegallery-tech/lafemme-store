import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import { ThemeScript } from "@/components/theme/ThemeScript";
import { StructuredData } from "@/components/seo/StructuredData";
import { absoluteUrl, getSiteUrl, isPublicSite } from "@/lib/seo";
import { brandName, brandAlternateNames, brandDisplayName, brandHomeTitle, brandDescription } from "@/lib/brand";
import "./globals.css";
import "./buying-guides.css";

// Domain and indexing policy are runtime settings, not Docker build-time defaults.
export const dynamic = "force-dynamic";

const vazirmatn = localFont({
  src: [
    { path: "../../public/assets/fonts/Vazirmatn-Regular.woff2", weight: "400", style: "normal" },
    { path: "../../public/assets/fonts/Vazirmatn-Medium.woff2", weight: "500", style: "normal" },
    { path: "../../public/assets/fonts/Vazirmatn-SemiBold.woff2", weight: "600", style: "normal" },
    { path: "../../public/assets/fonts/Vazirmatn-Bold.woff2", weight: "700", style: "normal" },
  ],
  variable: "--font-vazirmatn",
  display: "swap",
  preload: true,
  fallback: ["Arial", "sans-serif"],
});

export function generateMetadata(): Metadata {
  return {
  metadataBase: new URL(getSiteUrl()),
  title: { default: brandHomeTitle, template: "%s | لفم" },
  description: brandDescription,
  keywords: ["شمش طلا", "شمش نقره", brandName, "La Femme"],
  authors: [{ name: brandDisplayName }],
  creator: brandDisplayName,
  publisher: brandDisplayName,
  applicationName: brandName,
  robots: {
    index: isPublicSite(),
    follow: true,
    googleBot: {
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  icons: {
    icon: [{ url: "/assets/images/logo.png", type: "image/png" }],
    shortcut: "/assets/images/logo.png",
    apple: "/assets/images/logo.png",
  },
  openGraph: {
    type: "website",
    locale: "fa_IR",
    siteName: brandName,
    title: brandHomeTitle,
    description: brandDescription,
    images: [{ url: "/assets/images/logo.png", alt: brandDisplayName }],
  },
  twitter: {
    card: "summary_large_image",
    title: brandHomeTitle,
    description: brandDescription,
    images: ["/assets/images/logo.png"],
  },
  };
}

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#0B0B0B",
  colorScheme: "dark light",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const structuredData = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": `${absoluteUrl("/")}#organization`,
        name: brandName,
        alternateName: brandAlternateNames,
        url: absoluteUrl("/"),
        logo: absoluteUrl("/assets/images/logo.png"),
        telephone: "+982155622804",
        address: {
          "@type": "PostalAddress",
          addressLocality: "تهران",
          streetAddress: "بازار بزرگ تهران، پاساژ اردیبهشت، پلاک ۲/۳۱",
          addressCountry: "IR",
        },
        sameAs: ["https://instagram.com/lafemmegold"],
      },
      {
        "@type": "WebSite",
        "@id": `${absoluteUrl("/")}#website`,
        name: brandName,
        alternateName: brandAlternateNames,
        url: absoluteUrl("/"),
        inLanguage: "fa-IR",
        publisher: { "@id": `${absoluteUrl("/")}#organization` },
      },
    ],
  };
  return (
    <html lang="fa" dir="rtl" className={vazirmatn.variable} suppressHydrationWarning>
      <head>
        <ThemeScript />
        <StructuredData data={structuredData} />
      </head>
      <body>{children}</body>
    </html>
  );
}
