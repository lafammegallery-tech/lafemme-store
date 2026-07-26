import { Prisma } from "@/generated/prisma/client";
import { getPrisma } from "../prisma";

/** نوع آیتم سبد همراه با محصول. */
export type CartWithItems = Prisma.CartGetPayload<{
  include: {
    items: {
      include: {
        product: {
          include: {
            images: { where: { isPrimary: true }; take: 1 };
          };
        };
        variant: true;
      };
    };
  };
}>;

export const cartRepository = {
  /** یافتن سبد خرید کاربر. */
  findByUserId(userId: string): Promise<CartWithItems | null> {
    return getPrisma().cart.findFirst({
      where: { userId },
      include: {
        items: {
          include: {
            product: {
              include: {
                images: { where: { isPrimary: true }, take: 1 },
              },
            },
            variant: true,
          },
          orderBy: { createdAt: "desc" },
        },
      },
    });
  },

  /** یافتن سبد خرید مهمان. */
  findBySessionId(sessionId: string): Promise<CartWithItems | null> {
    return getPrisma().cart.findFirst({
      where: { sessionId },
      include: {
        items: {
          include: {
            product: {
              include: {
                images: { where: { isPrimary: true }, take: 1 },
              },
            },
            variant: true,
          },
          orderBy: { createdAt: "desc" },
        },
      },
    });
  },

  /** ایجاد سبد خرید جدید. */
  create(data: { userId?: string; sessionId?: string }) {
    return getPrisma().cart.create({ data });
  },

  /** افزودن آیتم به سبد خرید. */
  async addItem(
    cartId: string,
    productId: string,
    unitPrice: number,
    quantity = 1,
    variantId?: string,
  ) {
    // باید findFirst استفاده شود چون NULL در unique index با NULL برابر نیست در SQL
    const existing = await getPrisma().cartItem.findFirst({
      where: {
        cartId,
        productId,
        variantId: variantId ?? null,
      },
    });

    if (existing) {
      return getPrisma().cartItem.update({
        where: { id: existing.id },
        data: { quantity: existing.quantity + quantity },
      });
    }

    return getPrisma().cartItem.create({
      data: { cartId, productId, variantId: variantId ?? null, quantity, unitPrice },
    });
  },

  /** حذف آیتم از سبد خرید. */
  removeItem(itemId: string) {
    return getPrisma().cartItem.delete({ where: { id: itemId } });
  },

  /** به‌روزرسانی تعداد آیتم. */
  updateQuantity(itemId: string, quantity: number) {
    if (quantity <= 0) {
      return getPrisma().cartItem.delete({ where: { id: itemId } });
    }
    return getPrisma().cartItem.update({
      where: { id: itemId },
      data: { quantity },
    });
  },

  /** پاک کردن سبد خرید. */
  clearCart(cartId: string) {
    return getPrisma().cartItem.deleteMany({ where: { cartId } });
  },

  /** محاسبه جمع کل سبد خرید. */
  async getCartTotal(cartId: string): Promise<number> {
    const items = await getPrisma().cartItem.findMany({
      where: { cartId },
      select: { unitPrice: true, quantity: true },
    });

    return items.reduce((sum, item) => {
      return sum + Number(item.unitPrice) * item.quantity;
    }, 0);
  },
};
