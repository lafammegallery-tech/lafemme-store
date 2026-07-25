import { cn } from "./lib/cn";
export interface LoadingProps {
  label?: string;
  size?: "sm" | "md" | "lg";
  className?: string;
}
/** Accessible loading indicator with visually hidden status text. */
export function Loading({ label = "در حال بارگذاری", size = "md", className }: LoadingProps) {
  const sizes = { sm: "h-4 w-4", md: "h-7 w-7", lg: "h-10 w-10" };
  return (
    <span role="status" className={cn("inline-flex items-center justify-center", className)}>
      <span
        aria-hidden="true"
        className={cn(
          "animate-lf-spin rounded-full border-2 border-lf-gold/30 border-t-lf-gold",
          sizes[size],
        )}
      />
      <span className="sr-only">{label}</span>
    </span>
  );
}
