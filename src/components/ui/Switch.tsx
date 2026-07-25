"use client";
import type { ButtonHTMLAttributes } from "react";
import { cn } from "./lib/cn";
export interface SwitchProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, "onChange"> {
  checked: boolean;
  onCheckedChange?: (checked: boolean) => void;
  label: string;
}
/** ARIA switch with controlled state and keyboard-compatible button semantics. */
export function Switch({
  checked,
  onCheckedChange,
  label,
  className,
  disabled,
  ...props
}: SwitchProps) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      disabled={disabled}
      onClick={() => onCheckedChange?.(!checked)}
      className={cn(
        "relative inline-flex h-7 w-12 rounded-full border border-lf-border transition focus-visible:outline-none focus-visible:shadow-lf-focus disabled:opacity-50",
        checked ? "bg-lf-gold" : "bg-lf-surface",
        className,
      )}
      {...props}
    >
      <span
        className={cn(
          "absolute top-1 h-5 w-5 rounded-full bg-white transition-transform",
          checked ? "translate-x-1" : "translate-x-6",
        )}
      />
    </button>
  );
}
