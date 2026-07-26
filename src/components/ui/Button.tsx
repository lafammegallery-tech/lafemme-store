import { forwardRef, type ButtonHTMLAttributes } from "react";
import { cn } from "./lib/cn";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
  loading?: boolean;
}

/** Accessible action button with reusable variants and a non-destructive loading state. */
export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { variant = "primary", size = "md", loading = false, disabled, className, children, ...props },
  ref,
) {
  const variants = {
    primary: "bg-lf-gold text-lf-black shadow-lf-gold hover:bg-lf-gold-light hover:-translate-y-0.5 active:translate-y-0",
    secondary: "border border-lf-gold bg-transparent text-lf-gold hover:bg-lf-gold/10 hover:-translate-y-0.5 active:translate-y-0",
    ghost: "bg-transparent text-lf-white hover:bg-lf-gold/10",
    danger: "bg-lf-danger text-white hover:brightness-110",
  };
  const sizes = {
    sm: "min-h-9 px-3 py-1.5 text-sm",
    md: "min-h-11 px-5 py-2.5 text-sm",
    lg: "min-h-12 px-7 py-3 text-base",
  };
  return (
    <button
      ref={ref}
      type="button"
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-lf-sm font-semibold transition duration-lf focus-visible:outline-none focus-visible:shadow-lf-focus disabled:cursor-not-allowed disabled:opacity-50",
        variants[variant],
        sizes[size],
        className,
      )}
      {...props}
    >
      {loading && (
        <span
          aria-hidden="true"
          className="h-4 w-4 animate-lf-spin rounded-full border-2 border-current border-t-transparent"
        />
      )}
      {children}
    </button>
  );
});
