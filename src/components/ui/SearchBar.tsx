import type { FormHTMLAttributes, InputHTMLAttributes } from "react";
import { Input } from "./Input";
import { Button } from "./Button";
export interface SearchBarProps extends FormHTMLAttributes<HTMLFormElement> {
  inputName?: string;
  placeholder?: string;
  submitLabel?: string;
  inputProps?: Omit<InputHTMLAttributes<HTMLInputElement>, "name" | "type" | "placeholder">;
}
/** نوار جست‌وجوی قابل استفاده مجدد با پشتیبانی از فرم GET و ورودی کنترل‌شده. */
export function SearchBar({
  inputName = "q",
  placeholder = "جست‌وجو...",
  submitLabel = "جست‌وجو",
  inputProps,
  ...props
}: SearchBarProps) {
  return (
    <form role="search" className="flex w-full gap-2" {...props}>
      <Input
        type="search"
        name={inputName}
        placeholder={placeholder}
        aria-label={placeholder}
        {...inputProps}
      />
      <Button type="submit">{submitLabel}</Button>
    </form>
  );
}
