/**
 * داده‌های موقت صفحه اصلی LaFemme
 * بعداً از API و دیتابیس خوانده می‌شوند.
 */

/** داده‌های موقت محصول منتخب صفحه اصلی. */
export interface FeaturedProduct {
  id: string;
  name: string;
  price: number;
  imageSrc: string;
  href: string;
  weight: string;
}

export const featuredProducts: FeaturedProduct[] = [
  {
    id: "1",
    name: "شمش طلای ۱۸ عیار یک گرمی",
    price: 18500000,
    imageSrc: "/assets/images/hero-gold-bar.png",
    href: "/products/1",
    weight: "۱ گرم",
  },
  {
    id: "2",
    name: "شمش طلای ۱۸ عیار پنج گرمی",
    price: 92000000,
    imageSrc: "/assets/images/hero-gold-bar.png",
    href: "/products/2",
    weight: "۵ گرم",
  },
  {
    id: "3",
    name: "شمش طلای خالص ۱۰ گرمی",
    price: 185000000,
    imageSrc: "/assets/images/hero-gold-bar.png",
    href: "/products/3",
    weight: "۱۰ گرم",
  },
];


/**
 * ویژگی‌های برند
 */
export const brandFeatures = [
  {
    title: "طلای اصیل",
    description: "محصولات طلا با کیفیت و اصالت.",
    icon: "✦",
  },
  {
    title: "سرمایه‌گذاری مطمئن",
    description: "انتخابی مناسب برای حفظ ارزش سرمایه.",
    icon: "◇",
  },
  {
    title: "تجربه لوکس",
    description: "ترکیب کیفیت، زیبایی و اعتماد.",
    icon: "◌",
  },
  {
    title: "تحویل امن",
    description: "بسته‌بندی ویژه و ارسال بیمه شده.",
    icon: "◈",
  },
];


/**
 * دسته‌بندی‌های فروشگاه
 */
export const categories = [
  {
    id: "1",
    title: "شمش طلا",
    href: "/products?category=gold-bars",
  },
  {
    id: "2",
    title: "طلای سرمایه‌گذاری",
    href: "/products?category=investment-gold",
  },
  {
    id: "3",
    title: "محصولات جدید",
    href: "/products?category=new",
  },
];


/**
 * نظرات مشتریان
 */
export const testimonials = [
  {
    name: "مشتری لافم",
    text: "تجربه خرید بسیار حرفه‌ای و مطمئن بود.",
  },
  {
    name: "مشتری لافم",
    text: "کیفیت محصول و بسته‌بندی عالی بود.",
  },
];
