import { forwardRef, type InputHTMLAttributes } from "react";
import { cn } from "./lib/cn";
export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  error?: boolean;
}
/** Accessible text input that forwards native attributes and refs. */
export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { error, className, ...props },
  ref,
) {
  return (
    <input
      ref={ref}
      aria-invalid={error || undefined}
      className={cn(
        "min-h-11 w-full rounded-lf-sm border bg-lf-surface px-4 py-2 text-lf-white outline-none transition duration-lf placeholder:text-lf-gray focus:border-lf-gold focus:shadow-lf-focus disabled:opacity-50",
        error ? "border-lf-danger" : "border-lf-border",
        className,
      )}
      {...props}
    />
  );
});
