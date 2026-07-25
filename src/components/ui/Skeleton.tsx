import type { HTMLAttributes } from "react";
import { cn } from "./lib/cn";
/** Non-interactive placeholder used while content is loading. */
export function Skeleton({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      aria-hidden="true"
      className={cn("animate-lf-pulse rounded-lf-sm bg-white/10", className)}
      {...props}
    />
  );
}
