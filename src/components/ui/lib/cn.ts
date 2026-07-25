/** Joins conditional Tailwind class names without adding a runtime dependency. */
export function cn(...values: Array<string | false | null | undefined>): string {
  return values.filter(Boolean).join(" ");
}
