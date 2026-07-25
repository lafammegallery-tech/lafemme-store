import type { HTMLAttributes } from "react";
import { cn } from "./lib/cn";
/** Neutral surface container for composable content. */
export function Card({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "rounded-lf-md border border-lf-border bg-lf-surface shadow-lf-card",
        className,
      )}
      {...props}
    />
  );
}
