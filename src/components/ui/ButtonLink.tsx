import Link from "next/link";
import type { ReactNode } from "react";

interface ButtonLinkProps {
  href: string;
  children: ReactNode;
  className?: string;
}

/** Reusable link styled with the existing button classes. */
export function ButtonLink({ href, children, className = "btn btn-primary" }: ButtonLinkProps) {
  return (
    <Link href={href} className={className}>
      {children}
    </Link>
  );
}
