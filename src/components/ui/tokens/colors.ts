/**
 * Brand color tokens for typed, non-CSS contexts (e.g. inline SVG fills).
 * Mirrors the dark-theme values of the CSS variables defined in globals.css —
 * those variables (and the matching `lf.*` Tailwind colors) are the source of
 * truth and respond to the light/dark toggle; this object does not.
 */
export const colors = {
  black: "#050811",
  background: "#050811",
  surface: "#0d1222",
  surfaceRaised: "#161f38",
  gold: "#D4AF37",
  goldLight: "#e8cc6a",
  goldDark: "#a87c1a",
  white: "#FAF7F0",
  gray: "#9ba3be",
  grayLight: "#c8cfe0",
  danger: "#e2685c",
  success: "#4fa97d",
  warning: "#e4c78c",
} as const;
