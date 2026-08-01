/**
 * نوع‌های مشترک محصول در فروشگاه La Femme.
 * این نوع هم به‌عنوان قرارداد داده Mock و هم برای اتصال آینده به Prisma استفاده می‌شود.
 */

/** نوع فلز محصول؛ برای فیلتر کردن طلا و نقره به کار می‌رود. */
export type ProductType = "gold" | "silver";

/**
 * مدل استاندارد محصول.
 * شامل فیلدهای اصلی (مشخصات کاربردی) و فیلدهای غنی‌سازی نمایشی است.
 */
export interface Product {
  /** شناسه یکتای محصول */
  id: string;
  /** نام نمایشی محصول */
  name: string;
  /** شناسه یکتای قابل خواندن در URL */
  slug: string;
  /** توضیحات محصول */
  description: string;
  /** قیمت به تومان */
  price: number;
  /** مسیر تصویر محصول در پوشه public */
  imageSrc: string;
  /** دسته‌بندی محصول */
  category: string;
  /** لینک صفحه جزئیات محصول */
  href: string;
  /** موجودی انبار */
  stock: number;

  // ===== فیلدهای غنی‌سازی نمایشی (Storefront) =====

  /** نوع فلز؛ برای فیلتر طلا/نقره */
  type: ProductType;
  /** برچسب وزن نمایشی (مثل «۱ گرم») */
  weight: string;
  /** مقدار عددی وزن برای مرتب‌سازی */
  weightValue: number;
  /** خلوص فلز نمایشی (مثل «عیار ۱۸») */
  purity: string;
  /** لیست مشخصات فنی محصول */
  specifications: string[];
  /** برچسب اختیاری روی کارت محصول (مثل «جدید») */
  badge?: string;
  /** آیا محصول منتخب است */
  isFeatured?: boolean;
  certificate?: string;
  brand?: string;
  premiumPercent?: number;
  fixedPremium?: number;
  marketPricePerGram?: number;
  isLivePrice?: boolean;
  images?: Array<{ id: string; url: string; altText?: string | null; isPrimary: boolean; sortOrder: number }>;
}
