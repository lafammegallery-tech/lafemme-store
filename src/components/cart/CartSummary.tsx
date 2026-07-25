import Link from "next/link";

interface CartSummaryProps {
  total: number;
  itemCount?: number;
}

/** خلاصه مبلغ سبد خرید با جزئیات و دکمه ادامه به تسویه حساب. */
export function CartSummary({ total, itemCount = 0 }: CartSummaryProps) {
  const shippingCost = total > 0 ? 0 : 0;
  const grandTotal = total + shippingCost;

  return (
    <aside className="cart-summary">
      <h2>خلاصه سفارش</h2>

      <div className="cart-summary-row">
        <span>تعداد کالاها</span>
        <span>{itemCount.toLocaleString("fa-IR")}</span>
      </div>

      <div className="cart-summary-row">
        <span>جمع کالاها</span>
        <span>{new Intl.NumberFormat("fa-IR").format(total)} تومان</span>
      </div>

      <div className="cart-summary-row">
        <span>هزینه ارسال</span>
        <span>{shippingCost === 0 ? "رایگان" : `${new Intl.NumberFormat("fa-IR").format(shippingCost)} تومان`}</span>
      </div>

      <div className="cart-summary-divider" />

      <div className="cart-summary-total">
        <span>مبلغ قابل پرداخت</span>
        <span>{new Intl.NumberFormat("fa-IR").format(grandTotal)} تومان</span>
      </div>

      <Link href="/checkout" className="btn btn-primary cart-summary-checkout">
        ادامه به تسویه حساب
      </Link>

      <Link href="/products" className="btn btn-secondary cart-summary-continue">
        ادامه خرید
      </Link>
    </aside>
  );
}
