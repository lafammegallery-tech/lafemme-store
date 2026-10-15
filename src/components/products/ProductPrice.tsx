// نمایش قیمت به تومان
import { formatMoney } from "@/lib/format-money";
export function ProductPrice({ value }: { value: number }) {
  return <div>{formatMoney(value)} تومان</div>;
}
