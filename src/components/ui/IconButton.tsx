import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from "react";
import { cn } from "./lib/cn";

export interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  label: string;
  icon: ReactNode;
  size?: "sm" | "md" | "lg";
}
/** Square icon-only control that requires an accessible label. */
export const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(function IconButton(
  { label, icon, size = "md", className, ...props },
  ref,
) {
  const sizes = { sm: "h-9 w-9", md: "h-11 w-11", lg: "h-12 w-12" };
  return (
    <button
      ref={ref}
      type="button"
      aria-label={label}
      className={cn(
        "inline-flex items-center justify-center rounded-full border border-lf-border bg-lf-surface text-lf-white transition duration-lf hover:border-lf-gold hover:text-lf-gold hover:-translate-y-0.5 active:translate-y-0 focus-visible:outline-none focus-visible:shadow-lf-focus disabled:opacity-50",
        sizes[size],
        className,
      )}
      {...props}
    >
      {icon}
    </button>
  );
});
