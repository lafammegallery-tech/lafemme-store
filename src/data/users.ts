/**
 * داده موقت کاربران فروشگاه La Femme.
 * بعداً با مدل User در Prisma جایگزین می‌شود.
 */
export interface UserData {
  /** شناسه یکتای کاربر */
  id: string;
  /** نام کامل کاربر */
  name: string;
  /** شماره موبایل */
  phone: string;
  /** ایمیل کاربر */
  email: string;
  /** نقش کاربر */
  role: "CUSTOMER" | "STAFF" | "ADMIN";
}

/** کاربر نمایشی پیش‌فرض. */
export const mockUser: UserData = {
  id: "user-1",
  name: "کاربر لافم",
  phone: "09120000000",
  email: "user@lafemme.ir",
  role: "CUSTOMER",
};

/** کاربر مدیر نمایشی. */
export const mockAdmin: UserData = {
  id: "admin-1",
  name: "مدیر لافم",
  phone: "09120000000",
  email: "admin@lafemme.local",
  role: "ADMIN",
};

/** لیست کاربران نمایشی. */
export const mockUsers: UserData[] = [mockUser, mockAdmin];
