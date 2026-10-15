import Image from "next/image";
import { formatMoney } from "@/lib/format-money";
import type { CartItemData } from "@/types/cart";

interface OrderSummaryProps {
  items: CartItemData[];
  total: number;
}

/** خلاصه سفارش با لیست کالاها و مجموع قابل پرداخت. */
export function OrderSummary({ items, total }: OrderSummaryProps) {
  const shippingCost = 0;
  const grandTotal = total + shippingCost;

  return (
    <aside className="order-summary">
      <h2>خلاصه سفارش</h2>

      <div className="order-summary-items">
        {items.map((item) => (
          <div key={item.id} className="order-summary-item">
            <Image
              src={item.image}
              alt={item.title}
              width={60}
              height={60}
              sizes="60px"
              className="order-summary-item-image"
            />
            <div className="order-summary-item-info">
              <h3>{item.title}</h3>
              {item.variant && <span>{item.variant}</span>}
              <span className="order-summary-item-quantity">
                {item.quantity.toLocaleString("fa-IR")} عدد
              </span>
            </div>
            <div className="order-summary-item-price">
              {formatMoney(item.price * item.quantity)} تومان
            </div>
          </div>
        ))}
      </div>

      <div className="order-summary-divider" />

      <div className="order-summary-row">
        <span>جمع کالاها</span>
        <span>{formatMoney(total)} تومان</span>
      </div>

      <div className="order-summary-row">
        <span>هزینه ارسال</span>
        <span>طبق روش ارسال انتخاب‌شده؛ به مبلغ کالاها اضافه می‌شود</span>
      </div>

      <div className="order-summary-total">
        <span>جمع کالاها، پیش از ارسال و تخفیف</span>
        <span>{formatMoney(grandTotal)} تومان</span>
      </div>
    </aside>
  );
}
