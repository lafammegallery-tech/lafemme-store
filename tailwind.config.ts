import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  // Preserve the approved legacy UI while allowing the isolated UI library to use Tailwind utilities.
  corePlugins: { preflight: false },
  theme: {
    extend: {
      colors: {
        lf: {
          black: "#04060C",
          background: "#0A0E1C",
          surface: "#131A30",
          "surface-raised": "#1B2440",
          gold: "#C9A46B",
          "gold-light": "#E4C78C",
          "gold-dark": "#9C7A45",
          white: "#EEF0F7",
          gray: "#A7ADC7",
          "gray-light": "#CDD1E4",
          border: "rgba(238,240,247,.08)",
          danger: "#D9695F",
          success: "#4FA97D",
          warning: "#E4C78C",
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
        "lf-gold": "0 18px 40px rgba(201,164,107,.20)",
        "lf-focus": "0 0 0 3px rgba(201,164,107,.30)",
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
