import type { MetadataRoute } from "next";
export default function manifest(): MetadataRoute.Manifest {
  return { name: "La Femme | طلا و نقره", short_name: "La Femme", description: "فروشگاه شمش طلا و نقره با قیمت لحظه‌ای", start_url: "/", display: "standalone", background_color: "#0b0b0b", theme_color: "#0b0b0b", lang: "fa", dir: "rtl", icons: [{ src: "/assets/images/logo.png", sizes: "512x512", type: "image/png" }] };
}
