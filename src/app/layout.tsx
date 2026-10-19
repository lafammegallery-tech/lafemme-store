import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import { ThemeScript } from "@/components/theme/ThemeScript";
import { StructuredData } from "@/components/seo/StructuredData";
import { absoluteUrl, getSiteUrl, isPublicSite } from "@/lib/seo";
import "./globals.css";

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
  title: { default: "La Femme | شمش طلا و نقره", template: "%s | La Femme" },
  description: "فروش شمش طلا و نقره برند La Femme",
  keywords: ["شمش طلا", "شمش نقره", "La Femme"],
  authors: [{ name: "La Femme" }],
  creator: "La Femme",
  publisher: "La Femme",
  applicationName: "La Femme",
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
    siteName: "La Femme",
    title: "La Femme | شمش طلا و نقره",
    description: "فروش شمش طلا و نقره برند La Femme",
    images: [{ url: "/assets/images/logo.png", alt: "La Femme" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "La Femme | شمش طلا و نقره",
    description: "فروش شمش طلا و نقره برند La Femme",
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
        name: "La Femme Gold",
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
        name: "La Femme",
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
