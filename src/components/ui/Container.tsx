import type { ReactNode } from "react";

interface ContainerProps {
  children: ReactNode;
  className?: string;
}

/** Reusable container matching the existing `.container` utility. */
export function Container({ children, className = "" }: ContainerProps) {
  return <div className={`container ${className}`.trim()}>{children}</div>;
}
