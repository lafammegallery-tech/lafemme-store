import { forwardRef, type TextareaHTMLAttributes } from "react";
import { cn } from "./lib/cn";
/** Accessible multiline field styled consistently with Input. */
export const Textarea = forwardRef<
  HTMLTextAreaElement,
  TextareaHTMLAttributes<HTMLTextAreaElement>
>(function Textarea({ className, ...props }, ref) {
  return (
    <textarea
      ref={ref}
      className={cn(
        "min-h-28 w-full resize-y rounded-lf-sm border border-lf-border bg-lf-surface px-4 py-3 text-lf-white outline-none placeholder:text-lf-gray focus:border-lf-gold focus:shadow-lf-focus disabled:opacity-50",
        className,
      )}
      {...props}
    />
  );
});
