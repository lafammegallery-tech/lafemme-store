/** مسیرهای استاندارد فروشگاه La Femme. */
export const routes = {
  home: "/",
  products: "/products",
  /** این تابع آدرس صفحه محصول را با شناسه می‌سازد. */
  product: (id: string) => `/products/${id}`,
  cart: "/cart",
  checkout: "/checkout",
  login: "/login",
  register: "/register",
  forgotPassword: "/forgot-password",
  dashboard: "/dashboard",
  profile: "/profile",
  orders: "/orders",
  addresses: "/addresses",
  wishlist: "/wishlist",
  favorites: "/favorites",
  search: "/search",
  about: "/about",
  contact: "/contact",
  faq: "/faq",
  privacy: "/privacy",
  terms: "/terms",
} as const;

export type RouteKey = keyof typeof routes;
