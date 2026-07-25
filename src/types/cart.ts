/**
 * نوع‌های مشترک سبد خرید در فروشگاه La Femme.
 */

/** آیتم سبد خرید؛ آماده اتصال به مدل CartItem در Prisma. */
export interface CartItemData {
  /** شناسه یکتای آیتم */
  id: string;
  /** شناسه محصول مرتبط */
  productId: string;
  /** نام نمایشی محصول */
  title: string;
  /** مسیر تصویر محصول در پوشه public */
  image: string;
  /** قیمت واحد به تومان */
  price: number;
  /** تعداد در سبد خرید */
  quantity: number;
  /** برچسب وزن یا مدل نمایشی (اختیاری) */
  variant?: string;
}
