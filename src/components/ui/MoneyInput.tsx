"use client";

import { useState } from "react";
import { Input, type InputProps } from "./Input";
import { formatMoneyInput, normalizeMoneyInput } from "@/lib/format-money";

type MoneyInputProps = Omit<InputProps, "type" | "value" | "defaultValue" | "onChange" | "min" | "step"> & {
  value?: string | number;
  defaultValue?: string | number;
  onValueChange?: (value: string) => void;
  allowDecimals?: boolean;
};

/** Visible grouped text plus an unformatted field for existing server actions. */
export function MoneyInput({ name, value, defaultValue = "", onValueChange, allowDecimals = false, ...props }: MoneyInputProps) {
  const [internal, setInternal] = useState(String(defaultValue));
  const raw = normalizeMoneyInput(String(value ?? internal));
  return <>
    <Input {...props} type="text" inputMode={allowDecimals ? "decimal" : "numeric"} value={formatMoneyInput(raw)}
      pattern={allowDecimals ? "[0-9۰-۹٠-٩٬,]+([.٫][0-9۰-۹٠-٩]+)?" : "[0-9۰-۹٠-٩٬,]+"}
      title={allowDecimals ? "مبلغ معتبر به تومان وارد کنید" : "مبلغ صحیح به تومان وارد کنید"}
      onChange={event => {
        const next = normalizeMoneyInput(event.target.value);
        const input = event.target;
        const significantBefore = normalizeMoneyInput(input.value.slice(0, input.selectionStart ?? input.value.length)).length;
        setInternal(next);
        onValueChange?.(next);
        requestAnimationFrame(() => {
          let significant = 0, position = 0;
          while (position < input.value.length && significant < significantBefore) {
            if (input.value[position] !== "٬") significant++;
            position++;
          }
          input.setSelectionRange(position, position);
        });
      }} />
    {name && <input type="hidden" name={name} value={raw} disabled={props.disabled} />}
  </>;
}
