import { OrderStatus, Prisma } from "@/generated/prisma/client";
import { getPrisma } from "../prisma";

/** نوع سفارش همراه با آیتم‌ها. */
export type OrderWithItems = Prisma.OrderGetPayload<{
  include: {
    items: true;
    shipment: true;
    payments: true;
    address: true;
  };
}>;

/** داده‌های ایجاد سفارش جدید. */
export interface CreateOrderInput {
  userId?: string;
  addressId?: string;
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  subtotal: number;
  discountAmount?: number;
  shippingAmount?: number;
  totalAmount: number;
  shippingAddress: Prisma.InputJsonValue;
  customerNote?: string;
  items: Array<{
    productId?: string;
    variantId?: string;
    productName: string;
    variantName?: string;
    sku?: string;
    unitPrice: number;
    quantity: number;
    totalPrice: number;
  }>;
}

export const orderRepository = {
  /** یافتن سفارش‌های کاربر. */
  findByUserId(userId: string, limit = 20): Promise<OrderWithItems[]> {
    return getPrisma().order.findMany({
      where: { userId, deletedAt: null },
      include: {
        items: true,
        shipment: true,
        payments: true,
        address: true,
      },
      orderBy: { createdAt: "desc" },
      take: limit,
    });
  },

  /** یافتن سفارش بر اساس id. */
  findById(id: string): Promise<OrderWithItems | null> {
    return getPrisma().order.findFirst({
      where: { id, deletedAt: null },
      include: {
        items: true,
        shipment: true,
        payments: true,
        address: true,
      },
    });
  },

  /** یافتن سفارش بر اساس شماره سفارش. */
  findByOrderNumber(orderNumber: string): Promise<OrderWithItems | null> {
    return getPrisma().order.findFirst({
      where: { orderNumber, deletedAt: null },
      include: {
        items: true,
        shipment: true,
        payments: true,
        address: true,
      },
    });
  },

  /** ایجاد سفارش جدید. */
  create(input: CreateOrderInput) {
    return getPrisma().order.create({
      data: {
        ...(input.userId ? { user: { connect: { id: input.userId } } } : {}),
        ...(input.addressId ? { address: { connect: { id: input.addressId } } } : {}),
        orderNumber: `LF-${Date.now()}-${Math.floor(Math.random() * 1000).toString().padStart(3, "0")}`,
        customerName: input.customerName,
        customerPhone: input.customerPhone,
        customerEmail: input.customerEmail,
        subtotal: input.subtotal,
        discountAmount: input.discountAmount ?? 0,
        shippingAmount: input.shippingAmount ?? 0,
        totalAmount: input.totalAmount,
        shippingAddress: input.shippingAddress,
        customerNote: input.customerNote,
        items: {
          create: input.items,
        },
      },
      include: {
        items: true,
      },
    });
  },

  /** به‌روزرسانی وضعیت سفارش. */
  updateStatus(id: string, status: OrderStatus) {
    return getPrisma().order.update({
      where: { id },
      data: { status },
    });
  },

  /** شمارش سفارش‌های کاربر. */
  countByUserId(userId: string) {
    return getPrisma().order.count({
      where: { userId, deletedAt: null },
    });
  },
};
