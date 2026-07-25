interface LegacyMarkupProps {
  html: string;
  className?: string;
}

/** Renders preserved legacy markup while Phase 1 focuses on architecture, not redesign. */
export function LegacyMarkup({ html, className }: LegacyMarkupProps) {
  return <div className={className} dangerouslySetInnerHTML={{ __html: html }} />;
}
