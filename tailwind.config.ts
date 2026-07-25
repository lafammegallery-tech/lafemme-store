import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  // Preserve the approved legacy UI while allowing the isolated UI library to use Tailwind utilities.
  corePlugins: { preflight: false },
  theme: {
    extend: {
      colors: {
        lf: {
          black: "#050811",
          background: "#050811",
          surface: "#0B1224",
          "surface-raised": "#111A32",
          gold: "#D4AF37",
          "gold-light": "#E7C65C",
          "gold-dark": "#A88214",
          white: "#FFFFFF",
          gray: "#A5A5A5",
          "gray-light": "#D6D6D6",
          border: "rgba(255,255,255,.08)",
          danger: "#E85D5D",
          success: "#42B883",
          warning: "#E7C65C",
        },
      },
      fontFamily: { sans: ["var(--font-vazirmatn)", "Vazirmatn", "sans-serif"] },
      spacing: {
        "lf-section": "8.75rem",
        "lf-header": "5.625rem",
      },
      maxWidth: { "lf-container": "80rem" },
      borderRadius: {
        "lf-sm": "0.625rem",
        "lf-md": "1.125rem",
        "lf-lg": "1.75rem",
      },
      boxShadow: {
        "lf-card": "0 20px 60px rgba(0,0,0,.35)",
        "lf-gold": "0 18px 40px rgba(212,175,55,.20)",
        "lf-focus": "0 0 0 3px rgba(212,175,55,.30)",
      },
      transitionDuration: { lf: "350ms" },
      keyframes: {
        "lf-fade-in": { from: { opacity: "0" }, to: { opacity: "1" } },
        "lf-slide-up": {
          from: { opacity: "0", transform: "translateY(12px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        "lf-spin": { to: { transform: "rotate(360deg)" } },
        "lf-pulse": { "0%,100%": { opacity: ".45" }, "50%": { opacity: ".9" } },
      },
      animation: {
        "lf-fade-in": "lf-fade-in 200ms ease-out",
        "lf-slide-up": "lf-slide-up 250ms ease-out",
        "lf-spin": "lf-spin 800ms linear infinite",
        "lf-pulse": "lf-pulse 1.6s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};

export default config;
