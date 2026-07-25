/** Motion tokens. Components also respect prefers-reduced-motion utilities. */
export const animations = {
  durationFast: "200ms",
  durationBase: "350ms",
  durationSlow: "500ms",
  easing: "ease",
  fadeIn: "lf-fade-in 200ms ease-out",
  slideUp: "lf-slide-up 250ms ease-out",
  spin: "lf-spin 800ms linear infinite",
  pulse: "lf-pulse 1.6s ease-in-out infinite",
} as const;
