import { forwardRef, type InputHTMLAttributes, type ReactNode } from "react";
import { cn } from "./lib/cn";
export interface CheckboxProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "type"> {
  label?: ReactNode;
}
/** Native checkbox with a comfortably sized clickable label. */
export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(function Checkbox(
  { label, className, ...props },
  ref,
) {
  return (
    <label
      className={cn(
        "inline-flex cursor-pointer items-center gap-3 text-sm text-lf-gray-light",
        className,
      )}
    >
      <input
        ref={ref}
        type="checkbox"
        className="h-5 w-5 accent-lf-gold focus-visible:outline-none focus-visible:shadow-lf-focus"
        {...props}
      />
      {label}
    </label>
  );
});
