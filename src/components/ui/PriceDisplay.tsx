import type { HTMLAttributes } from "react";
import { cn } from "./lib/cn";
export interface PriceDisplayProps extends HTMLAttributes<HTMLSpanElement> {
  value: number;
  currency?: string;
  locale?: string;
}
/** Locale-aware monetary display; server remains responsible for authoritative pricing. */
export function PriceDisplay({
  value,
  currency = "تومان",
  locale = "fa-IR",
  className,
  ...props
}: PriceDisplayProps) {
  return (
    <span className={cn("font-semibold tabular-nums text-lf-gold", className)} dir="rtl" {...props}>
      {new Intl.NumberFormat(locale).format(value)}{" "}
      <span className="text-[.8em] text-lf-gray-light">{currency}</span>
    </span>
  );
}
