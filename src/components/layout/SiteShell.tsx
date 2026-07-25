import type { ReactNode } from "react";
import { LegacyMarkup } from "@/components/legacy/LegacyMarkup";

interface SiteShellProps {
  children: ReactNode;
  headerHtml?: string;
  footerHtml?: string;
}

/** Shared page shell. Header/footer variants are preserved from the original pages. */
export function SiteShell({ children, headerHtml, footerHtml }: SiteShellProps) {
  return (
    <>
      {headerHtml ? <LegacyMarkup html={headerHtml} /> : null}
      {children}
      {footerHtml ? <LegacyMarkup html={footerHtml} /> : null}
    </>
  );
}
