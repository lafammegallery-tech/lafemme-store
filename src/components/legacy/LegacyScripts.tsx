"use client";

import Script from "next/script";

interface LegacyScriptsProps {
  sources: string[];
}

/** Loads original classic scripts in source order to preserve existing behavior. */
export function LegacyScripts({ sources }: LegacyScriptsProps) {
  return sources.map((source) => <Script key={source} src={source} strategy="afterInteractive" />);
}
