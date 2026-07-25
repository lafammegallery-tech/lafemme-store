import { Prisma } from "@/generated/prisma/client";
import { getPrisma } from "../prisma";

/** داده‌های ایجاد کاربر جدید. */
export interface CreateUserInput {
  phone: string;
  email?: string;
  firstName?: string;
  lastName?: string;
  passwordHash?: string;
}

export const userRepository = {
  /** یافتن کاربر بر اساس id. */
  findById(id: string) {
    return getPrisma().user.findFirst({
      where: { id, deletedAt: null },
      include: {
        addresses: { where: { deletedAt: null }, orderBy: { isDefault: "desc" } },
        wishlist: { include: { items: { include: { product: true } } } },
      },
    });
  },

  /** یافتن کاربر بر اساس شماره تلفن. */
  findByPhone(phone: string) {
    return getPrisma().user.findFirst({
      where: { phone, deletedAt: null },
    });
  },

  /** یافتن کاربر بر اساس ایمیل. */
  findByEmail(email: string) {
    return getPrisma().user.findFirst({
      where: { email, deletedAt: null },
    });
  },

  /** ایجاد کاربر جدید. */
  create(data: CreateUserInput) {
    return getPrisma().user.create({ data });
  },

  /** به‌روزرسانی پروفایل کاربر. */
  updateProfile(id: string, data: Partial<CreateUserInput>) {
    return getPrisma().user.update({
      where: { id },
      data,
    });
  },

  /** حذف نرم کاربر. */
  softDelete(id: string) {
    return getPrisma().user.update({
      where: { id },
      data: { deletedAt: new Date(), isActive: false },
    });
  },

  /** یافتن آدرس‌های کاربر. */
  findAddresses(userId: string) {
    return getPrisma().address.findMany({
      where: { userId, deletedAt: null },
      orderBy: { isDefault: "desc" },
    });
  },

  /** ایجاد آدرس جدید. */
  createAddress(data: Prisma.AddressCreateInput) {
    return getPrisma().address.create({ data });
  },

  /** یافتن لیست علاقه‌مندی‌های کاربر. */
  findWishlist(userId: string) {
    return getPrisma().wishlist.findFirst({
      where: { userId },
      include: {
        items: {
          include: { product: true },
          orderBy: { createdAt: "desc" },
        },
      },
    });
  },
};
