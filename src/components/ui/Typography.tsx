import type { ElementType, HTMLAttributes, ReactNode } from "react";
import { cn } from "./lib/cn";

type TypographyVariant = "display" | "h1" | "h2" | "h3" | "body" | "bodySmall" | "caption";
const styles: Record<TypographyVariant, string> = {
  display: "text-4xl font-bold leading-tight md:text-6xl",
  h1: "text-3xl font-bold leading-tight md:text-5xl",
  h2: "text-2xl font-bold leading-snug md:text-4xl",
  h3: "text-xl font-semibold leading-snug md:text-2xl",
  body: "text-base leading-8",
  bodySmall: "text-sm leading-7",
  caption: "text-xs leading-6 text-lf-gray",
};

export interface TypographyProps extends HTMLAttributes<HTMLElement> {
  as?: ElementType;
  variant?: TypographyVariant;
  children: ReactNode;
}

/** Semantic typography primitive mapped to the project's approved type scale. */
export function Typography({
  as: Component = "p",
  variant = "body",
  className,
  children,
  ...props
}: TypographyProps) {
  return (
    <Component className={cn("font-sans text-lf-white", styles[variant], className)} {...props}>
      {children}
    </Component>
  );
}
