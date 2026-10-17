import type { ReactNode } from "react";
import { cn } from "./lib/cn";

/** Keeps a field's label visible after typing, with an optional hint underneath. */
export function Field({ label, hint, className, children }: {
  label: string;
  hint?: string;
  className?: string;
  children: ReactNode;
}) {
  return (
    <label className={cn("form-field", className)}>
      <span className="form-field-label">{label}</span>
      {children}
      {hint && <span className="form-field-hint">{hint}</span>}
    </label>
  );
}
