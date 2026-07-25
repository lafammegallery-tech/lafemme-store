// نمایش قیمت به تومان
export function ProductPrice({ value }: { value: number }) {
  return <div>{new Intl.NumberFormat("fa-IR").format(value)} تومان</div>;
}
