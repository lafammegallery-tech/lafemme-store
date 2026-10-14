import { test } from "node:test";
import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { getPrisma } from "../src/backend/database/prisma";
import { changeOrderStatus, expireUnpaidOrders } from "../src/backend/services/order-status.service";

const url = process.env.TEST_DATABASE_URL;
if (url) process.env.DATABASE_URL = url;
test("order lifecycle preserves inventory and cancellation is idempotent", { skip: !url }, async () => {
  const db = getPrisma();
  const suffix = randomUUID();
  const user = await db.user.create({ data: { phone: `test-${suffix}`, role: "ADMIN" } });
  const category = await db.category.create({ data: { name: "Integration test", slug: `test-${suffix}` } });
  const product = await db.product.create({ data: { name: "Test product", slug: `product-${suffix}`, categoryId: category.id, metalType: "GOLD", price: 1000, stock: 5, status: "ACTIVE", inventory: { create: { quantity: 5, reserved: 2 } } } });
  try {
    const makeOrder = (number: string, paid = false) => db.order.create({ data: {
      orderNumber: number, userId: user.id, customerName: "Test", customerPhone: "09000000001", subtotal: 1000, totalAmount: 1000,
      shippingAddress: {}, items: { create: { productId: product.id, productName: "Test", unitPrice: 1000, totalPrice: 1000, quantity: 1 } },
      payments: { create: { amount: 1000, method: "CARD_TO_CARD", status: paid ? "SUCCESS" : "PENDING" } }, shipment: { create: {} },
    } });
    const cancelled = await makeOrder(`cancel-${suffix}`);
    await assert.rejects(changeOrderStatus(cancelled.id, "CONFIRMED", user.id, "unpaid"));
    await changeOrderStatus(cancelled.id, "CANCELLED", user.id, "test");
    await changeOrderStatus(cancelled.id, "CANCELLED", user.id, "repeat");
    assert.equal((await db.inventory.findUniqueOrThrow({ where: { productId: product.id } })).reserved, 1);
    assert.equal((await db.payment.findFirstOrThrow({ where: { orderId: cancelled.id } })).status, "CANCELLED");
    const shipped = await makeOrder(`ship-${suffix}`, true);
    await changeOrderStatus(shipped.id, "CONFIRMED", user.id, "test");
    await changeOrderStatus(shipped.id, "PROCESSING", user.id, "test");
    await changeOrderStatus(shipped.id, "SHIPPED", user.id, "test");
    await changeOrderStatus(shipped.id, "SHIPPED", user.id, "repeat");
    const inventory = await db.inventory.findUniqueOrThrow({ where: { productId: product.id } });
    assert.equal(inventory.quantity, 4); assert.equal(inventory.reserved, 0);
    await changeOrderStatus(shipped.id, "DELIVERED", user.id, "test");
    assert.equal((await db.shipment.findUniqueOrThrow({ where: { orderId: shipped.id } })).status, "DELIVERED");
    await assert.rejects(changeOrderStatus(shipped.id, "CANCELLED", user.id, "invalid"));
    await db.inventory.update({ where: { productId: product.id }, data: { reserved: 1 } });
    const expired = await makeOrder(`expire-${suffix}`);
    await db.order.update({ where: { id: expired.id }, data: { createdAt: new Date(Date.now() - 25 * 3600_000) } });
    await expireUnpaidOrders(); await expireUnpaidOrders();
    assert.equal((await db.order.findUniqueOrThrow({ where: { id: expired.id } })).status, "CANCELLED");
    assert.equal((await db.inventory.findUniqueOrThrow({ where: { productId: product.id } })).reserved, 0);
  } finally {
    await db.order.deleteMany({ where: { userId: user.id } });
    await db.product.delete({ where: { id: product.id } });
    await db.category.delete({ where: { id: category.id } });
    await db.user.delete({ where: { id: user.id } });
    await db.$disconnect();
  }
});
