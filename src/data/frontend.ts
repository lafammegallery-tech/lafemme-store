/**
 * داده‌های آزمایشی صفحات Frontend
 * بعداً با Prisma جایگزین می‌شود.
 */

export const mockOrders = [
  {
    id: "1001",
    date: "1405/04/20",
    status: "تحویل شده",
    total: 18500000,
    amount: 18500000,
    items: [
      {
        name: "شمش طلای ۱۸ عیار",
        quantity: 1,
      },
    ],
  },
  {
    id: "1002",
    date: "1405/04/22",
    status: "در حال پردازش",
    total: 32000000,
    amount: 32000000,
    items: [
      {
        name: "شمش طلای سرمایه‌گذاری",
        quantity: 1,
      },
    ],
  },
];


export const mockUser = {
  name: "کاربر لافم",
  phone: "09120000000",
  email: "user@lafemme.ir",
};


export const mockAddresses = [
  {
    id: "1",
    title: "آدرس اصلی",
    text: "تهران، خیابان ولیعصر، پلاک ۱",
    postalCode: "1234567890",
  },
  {
    id: "2",
    title: "آدرس محل کار",
    text: "تهران، سعادت‌آباد، خیابان دوم",
    postalCode: "9876543210",
  },
];


export const mockFavorites = [
  {
    id: "1",
    name: "شمش طلای ۱۸ عیار",
    price: 18500000,
    imageSrc: "/assets/images/hero-gold-bar.png",
    href: "/products/1",
  },
  {
    id: "4",
    name: "شمش نقره خالص ۱۰ گرمی",
    price: 8500000,
    imageSrc: "/assets/images/hero-gold-bar.png",
    href: "/products/4",
  },
];

