import type { CartItemData } from "@/types/cart";
import { CartItem } from "./CartItem";
import { EmptyCart } from "./EmptyCart";

/** لیست آیتم‌های سبد خرید با مدیریت وضعیت خالی. */
export function CartList({ items }: { items: CartItemData[] }) {
  if (items.length === 0) {
    return <EmptyCart />;
  }

  return (
    <div className="cart-list">
      {items.map((item) => (
        <CartItem key={item.id} item={item} />
      ))}
    </div>
  );
}
