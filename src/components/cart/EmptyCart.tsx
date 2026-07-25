import Link from "next/link";

/** وضعیت خالی بودن سبد خرید با دکمه هدایت به محصولات. */
export function EmptyCart() {
  return (
    <div className="empty-cart">
      <div className="empty-cart-icon" aria-hidden="true">🛒</div>
      <h2>سبد خرید شما خالی است</h2>
      <p>هنوز محصولی به سبد خرید اضافه نکرده‌اید.</p>
      <Link href="/products" className="btn btn-primary">
        مشاهده محصولات
      </Link>
    </div>
  );
}
