/**
 * داده موقت دسته‌بندی‌های فروشگاه La Femme.
 * بعداً با مدل Category در Prisma جایگزین می‌شود.
 */
export interface CategoryData {
  /** شناسه یکتای دسته‌بندی */
  id: string;
  /** نام نمایشی دسته‌بندی */
  title: string;
  /** شناسه قابل خواندن در URL */
  slug: string;
  /** لینک فیلتر محصولات */
  href: string;
  /** توضیحات کوتاه */
  description?: string;
}

/** لیست دسته‌بندی‌های اصلی فروشگاه. */
export const categories: CategoryData[] = [
  {
    id: "1",
    title: "شمش طلا",
    slug: "gold-bars",
    href: "/products?category=gold-bars",
    description: "شمش‌های طلای استاندارد و سرمایه‌گذاری با عیارهای مختلف.",
  },
  {
    id: "2",
    title: "شمش نقره",
    slug: "silver-bars",
    href: "/products?category=silver-bars",
    description: "شمش‌های نقره با خلوص بالا مناسب سرمایه‌گذاری.",
  },
  {
    id: "3",
    title: "طلای سرمایه‌گذاری",
    slug: "investment-gold",
    href: "/products?category=investment-gold",
    description: "محصولات طلای ویژه برای سرمایه‌گذاری بلندمدت.",
  },
];
