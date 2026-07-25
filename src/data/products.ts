import type { Product } from "@/types/product";

/**
 * داده موقت محصولات فروشگاه La Femme.
 * محصولات شمش طلا و نقره و اقلام سرمایه‌گذاری را شامل می‌شود.
 * این داده‌ها بعداً از دیتابیس Prisma خوانده خواهند شد.
 */
export const products: Product[] = [
  {
    id: "1",
    name: "شمش طلای ۱۸ عیار یک گرمی",
    slug: "gold-bar-18k-1g",
    description:
      "شمش طلای استاندارد ۱۸ عیار مناسب سرمایه‌گذاری. دارای کد اصالت و بسته‌بندی امن لافم.",
    price: 18500000,
    imageSrc: "/assets/images/hero-gold-bar.png",
    category: "طلا",
    href: "/products/1",
    stock: 12,
    type: "gold",
    weight: "۱ گرم",
    weightValue: 1,
    purity: "عیار ۱۸",
    specifications: ["عیار ۱۸", "وزن ۱ گرم", "کد اصالت", "بسته‌بندی امن"],
    badge: "محبوب",
    isFeatured: true,
  },
  {
    id: "2",
    name: "شمش طلای ۱۸ عیار پنج گرمی",
    slug: "gold-bar-18k-5g",
    description:
      "شمش طلای باکیفیت لافم با وزن پنج گرم و خلوص بالا. انتخابی مناسب برای سرمایه‌گذاری بلندمدت.",
    price: 92000000,
    imageSrc: "/assets/images/hero-gold-bar.png",
    category: "طلا",
    href: "/products/2",
    stock: 8,
    type: "gold",
    weight: "۵ گرم",
    weightValue: 5,
    purity: "عیار ۱۸",
    specifications: ["عیار ۱۸", "وزن ۵ گرم", "کد اصالت", "بسته‌بندی امن"],
    badge: "جدید",
    isFeatured: true,
  },
  {
    id: "3",
    name: "شمش طلای خالص ۱۰ گرمی",
    slug: "gold-bar-24k-10g",
    description:
      "شمش طلای خالص ۲۴ عیار با وزن ده گرم. بالاترین خلوص و مناسب برای حفظ ارزش سرمایه.",
    price: 185000000,
    imageSrc: "/assets/images/hero-gold-bar.png",
    category: "طلا",
    href: "/products/3",
    stock: 5,
    type: "gold",
    weight: "۱۰ گرم",
    weightValue: 10,
    purity: "عیار ۲۴",
    specifications: ["عیار ۲۴", "وزن ۱۰ گرم", "کد اصالت", "بسته‌بندی امن"],
    isFeatured: true,
  },
  {
    id: "4",
    name: "شمش نقره خالص ۱۰ گرمی",
    slug: "silver-bar-10g",
    description:
      "شمش نقره با خلوص بالا مناسب سرمایه‌گذاری. طراحی اختصاصی لافم با کد اصالت.",
    price: 8500000,
    imageSrc: "/assets/images/hero-gold-bar.png",
    category: "نقره",
    href: "/products/4",
    stock: 20,
    type: "silver",
    weight: "۱۰ گرم",
    weightValue: 10,
    purity: "عیار ۹۹۹",
    specifications: ["عیار ۹۹۹", "وزن ۱۰ گرم", "کد اصالت", "بسته‌بندی امن"],
    badge: "جدید",
  },
  {
    id: "5",
    name: "شمش نقره ۵۰ گرمی",
    slug: "silver-bar-50g",
    description:
      "شمش نقره پنجاه گرمی با خلوص بالا. انتخابی اقتصادی برای سرمایه‌گذاری در فلزات گران‌بها.",
    price: 32000000,
    imageSrc: "/assets/images/hero-gold-bar.png",
    category: "نقره",
    href: "/products/5",
    stock: 15,
    type: "silver",
    weight: "۵۰ گرم",
    weightValue: 50,
    purity: "عیار ۹۹۹",
    specifications: ["عیار ۹۹۹", "وزن ۵۰ گرم", "کد اصالت", "بسته‌بندی امن"],
  },
  {
    id: "6",
    name: "شمش طلای سرمایه‌گذاری ۲۰ گرمی",
    slug: "gold-investment-bar-20g",
    description:
      "شمش طلای سرمایه‌گذاری با وزن بیست گرم و عیار ۱۸. بسته‌بندی ویژه و گواهی اصالت رسمی.",
    price: 370000000,
    imageSrc: "/assets/images/hero-gold-bar.png",
    category: "طلا",
    href: "/products/6",
    stock: 3,
    type: "gold",
    weight: "۲۰ گرم",
    weightValue: 20,
    purity: "عیار ۱۸",
    specifications: ["عیار ۱۸", "وزن ۲۰ گرم", "کد اصالت", "گواهی رسمی"],
    badge: "ویژه",
    isFeatured: true,
  },
];

/**
 * یافتن محصول بر اساس شناسه.
 * @param id شناسه محصول
 */
export function getProductById(id: string): Product | undefined {
  return products.find((product) => product.id === id);
}

/**
 * یافتن محصول بر اساس slug.
 * @param slug شناسه قابل خواندن محصول در URL
 */
export function getProductBySlug(slug: string): Product | undefined {
  return products.find((product) => product.slug === slug);
}

/** لیست محصولات منتخب. */
export const featuredProductList = products.filter(
  (product) => product.isFeatured,
);
