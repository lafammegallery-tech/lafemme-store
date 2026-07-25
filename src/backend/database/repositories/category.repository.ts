
import { getPrisma } from "../prisma";

export const categoryRepository = {
  /** یافتن تمام دسته‌بندی‌های فعال. */
  findAll() {
    return getPrisma().category.findMany({
      where: { isActive: true, deletedAt: null },
      orderBy: { sortOrder: "asc" },
    });
  },

  /** یافتن دسته‌بندی بر اساس slug. */
  findBySlug(slug: string) {
    return getPrisma().category.findFirst({
      where: { slug, isActive: true, deletedAt: null },
    });
  },

  /** یافتن دسته‌بندی با محصولات. */
  findWithProducts(slug: string) {
    return getPrisma().category.findFirst({
      where: { slug, isActive: true, deletedAt: null },
      include: {
        products: {
          where: { status: "ACTIVE", deletedAt: null },
          orderBy: { createdAt: "desc" },
        },
      },
    });
  },

  /** یافتن دسته‌بندی‌های والد (بدون والد). */
  findRoots() {
    return getPrisma().category.findMany({
      where: { parentId: null, isActive: true, deletedAt: null },
      orderBy: { sortOrder: "asc" },
      include: { children: true },
    });
  },
};
