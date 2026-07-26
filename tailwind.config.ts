import type { Config } from "tailwindcss";

/**
 * Lets `bg-lf-gold/10`-style opacity modifiers work on a CSS-variable color:
 * Tailwind can't decompose a plain `var(--x)` hex string into an alpha channel,
 * so colors that are used with an opacity modifier need an RGB-triplet variable instead.
 */
function withOpacity(rgbVar: string) {
  return ({ opacityValue }: { opacityValue?: string }) =>
    opacityValue === undefined ? `rgb(var(${rgbVar}))` : `rgb(var(${rgbVar}) / ${opacityValue})`;
}

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  // Preserve the approved legacy UI while allowing the isolated UI library to use Tailwind utilities.
  corePlugins: { preflight: false },
  theme: {
    extend: {
      colors: {
        // Every lf.* color resolves to the CSS variables defined in globals.css,
        // so Tailwind utility classes (bg-lf-gold, text-lf-white, ...) follow the
        // active [data-theme] automatically instead of needing dark:/light: variants.
        lf: {
          black: "var(--color-black)",
          background: "var(--color-background)",
          surface: "var(--color-surface)",
          "surface-raised": "var(--color-surface-raised)",
          gold: withOpacity("--color-gold-rgb"),
          "gold-light": "var(--color-gold-light)",
          "gold-dark": "var(--color-gold-dark)",
          white: "var(--color-white)",
          gray: "var(--color-gray)",
          "gray-light": "var(--color-gray-light)",
          border: "var(--color-border)",
          danger: withOpacity("--color-danger-rgb"),
          success: withOpacity("--color-success-rgb"),
          warning: "var(--color-warning)",
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
        "lf-card": "var(--shadow-card)",
        "lf-gold": "var(--shadow-gold)",
        "lf-focus": "0 0 0 3px rgb(var(--color-gold-rgb) / 0.35)",
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
