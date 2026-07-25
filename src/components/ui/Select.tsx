import { forwardRef, type SelectHTMLAttributes } from "react";
import { cn } from "./lib/cn";
/** Native select retained for keyboard, screen-reader, and mobile accessibility. */
export const Select = forwardRef<HTMLSelectElement, SelectHTMLAttributes<HTMLSelectElement>>(
  function Select({ className, ...props }, ref) {
    return (
      <select
        ref={ref}
        className={cn(
          "min-h-11 w-full rounded-lf-sm border border-lf-border bg-lf-surface px-4 py-2 text-lf-white outline-none focus:border-lf-gold focus:shadow-lf-focus disabled:opacity-50",
          className,
        )}
        {...props}
      />
    );
  },
);
