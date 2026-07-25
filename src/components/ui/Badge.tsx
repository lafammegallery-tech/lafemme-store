import type { HTMLAttributes } from "react";
import { cn } from "./lib/cn";
export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  tone?: "gold" | "neutral" | "success" | "danger";
}
/** Compact status label with semantic visual tones. */
export function Badge({ tone = "gold", className, ...props }: BadgeProps) {
  const tones = {
    gold: "bg-lf-gold/15 text-lf-gold",
    neutral: "bg-white/5 text-lf-gray-light",
    success: "bg-lf-success/15 text-lf-success",
    danger: "bg-lf-danger/15 text-lf-danger",
  };
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold",
        tones[tone],
        className,
      )}
      {...props}
    />
  );
}
