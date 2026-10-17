import Link from "next/link";
import { Icon } from "@/components/ui/Icon";

/** وضعیت خالی بودن سبد خرید با دکمه هدایت به محصولات. */
export function EmptyCart() {
  return (
    <div className="empty-cart">
      <div className="empty-cart-icon">
        <Icon name="cart" size={56} />
      </div>
      <h2>سبد خرید شما خالی است</h2>
      <p>هنوز محصولی به سبد خرید اضافه نکرده‌اید.</p>
      <Link href="/products" className="btn btn-primary">
        مشاهده محصولات
      </Link>
    </div>
  );
}
