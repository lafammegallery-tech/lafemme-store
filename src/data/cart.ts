import type { CartItemData } from "@/types/cart";

/**
 * داده موقت سبد خرید فروشگاه La Femme.
 * بعداً با مدل Cart و CartItem در Prisma جایگزین می‌شود.
 */
export const mockCartItems: CartItemData[] = [
  {
    id: "cart-1",
    productId: "1",
    title: "شمش طلای ۱۸ عیار یک گرمی",
    image: "/assets/images/hero-gold-bar.png",
    price: 18500000,
    quantity: 1,
    variant: "۱ گرم",
  },
  {
    id: "cart-2",
    productId: "4",
    title: "شمش نقره خالص ۱۰ گرمی",
    image: "/assets/images/hero-gold-bar.png",
    price: 8500000,
    quantity: 2,
    variant: "۱۰ گرم",
  },
];

/** مجموع قیمت سبد خرید (برابر مجموع قیمت واحد ضربدر تعداد). */
export const cartTotal = mockCartItems.reduce(
  (sum, item) => sum + item.price * item.quantity,
  0,
);
