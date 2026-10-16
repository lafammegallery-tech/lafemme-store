import { test } from "node:test";
import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { getPrisma } from "../src/backend/database/prisma";
import { changeOrderStatus, expireUnpaidOrders } from "../src/backend/services/order-status.service";
import { reviewPaymentReceipt } from "../src/backend/services/receipt-review.service";
import { saveBalanceDestination, submitReceiptBundle } from "../src/backend/services/staged-payment.service";
import { getPaymentPolicy } from "../src/backend/services/payment-policy.service";
import { paymentPlan } from "../src/lib/payment-policy";

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
    const reviewOrder = await makeOrder(`review-${suffix}`);
    const receipt = await db.paymentReceipt.create({ data: { orderId: reviewOrder.id, imageUrl: "/uploads/receipts/test.png" } });
    await reviewPaymentReceipt(receipt.id, false, user.id, "Unreadable");
    assert.equal((await db.order.findUniqueOrThrow({ where: { id: reviewOrder.id } })).status, "PENDING");
    await assert.rejects(reviewPaymentReceipt(receipt.id, true, user.id, null));
    const retry = await db.paymentReceipt.create({ data: { orderId: reviewOrder.id, imageUrl: "/uploads/receipts/retry.png" } });
    await reviewPaymentReceipt(retry.id, true, user.id, null);
    const approvedPayment = await db.payment.findFirstOrThrow({ where: { orderId: reviewOrder.id } });
    assert.equal(approvedPayment.status, "SUCCESS"); assert.equal(approvedPayment.failureReason, null);
    assert.equal((await db.order.findUniqueOrThrow({ where: { id: reviewOrder.id } })).status, "CONFIRMED");
    await assert.rejects(reviewPaymentReceipt(retry.id, true, user.id, null));
    const broken = await makeOrder(`broken-${suffix}`);
    await db.payment.deleteMany({ where: { orderId: broken.id } });
    const brokenReceipt = await db.paymentReceipt.create({ data: { orderId: broken.id, imageUrl: "/uploads/receipts/broken.png" } });
    await assert.rejects(reviewPaymentReceipt(brokenReceipt.id, true, user.id, null));
    assert.equal((await db.paymentReceipt.findUniqueOrThrow({ where: { id: brokenReceipt.id } })).status, "PENDING");
    assert.equal((await db.order.findUniqueOrThrow({ where: { id: broken.id } })).status, "PENDING");
  } finally {
    await db.order.deleteMany({ where: { userId: user.id } });
    await db.product.delete({ where: { id: product.id } });
    await db.category.delete({ where: { id: category.id } });
    await db.user.delete({ where: { id: user.id } });
    await db.$disconnect();
  }
});

test("custom percent is frozen per order even when global payment policy is disabled or changed", { skip: !url }, async () => {
  const db = getPrisma();
  const suffix = randomUUID();
  const admin = await db.user.create({ data: { phone: `policy-${suffix}`, role: "ADMIN" } });
  const before = await db.paymentPolicy.findUnique({ where: { id: "global" } });
  const orders: string[] = [];
  try {
    await db.paymentPolicy.upsert({ where: { id: "global" }, create: { twoStageEnabled: true, depositPercent: 25, thresholdAmount: 1000 }, update: { twoStageEnabled: true, depositPercent: 25, thresholdAmount: 1000 } });
    const policy = await getPaymentPolicy();
    const plan = paymentPlan(1001, policy);
    assert.equal(plan.deposit, 251);
    const order = await db.order.create({ data: {
      orderNumber: `policy-${suffix}`, customerName: "Policy", customerPhone: "09000000001", subtotal: 1001, totalAmount: 1001, shippingAddress: {}, twoStagePayment: true, depositPercent: plan.depositPercent,
      payments: { create: [{ stage: "DEPOSIT", amount: plan.deposit, method: "CARD_TO_CARD", metadata: { cardNumber: "6037991234567891" } }, { stage: "BALANCE", amount: plan.balance, method: "CARD_TO_CARD" }] },
    } });
    orders.push(order.id);
    await db.paymentPolicy.update({ where: { id: "global" }, data: { twoStageEnabled: false, depositPercent: 45, thresholdAmount: 90_000_000 } });
    assert.equal(paymentPlan(1001, await getPaymentPolicy()).twoStage, false);
    await submitReceiptBundle(order.id, "DEPOSIT", 0, ["/uploads/receipts/policy.webp"]);
    const depositReceipt = await db.paymentReceipt.findFirstOrThrow({ where: { orderId: order.id } });
    await reviewPaymentReceipt(depositReceipt.id, true, admin.id, null);
    let state = await db.order.findUniqueOrThrow({ where: { id: order.id }, include: { payments: true } });
    assert.equal(state.depositPercent, 25);
    assert.equal(state.status, "PENDING");
    await saveBalanceDestination(order.id, state.paymentRevision, { cardNumber: "6037991234567892", iban: "", cardHolder: "Test", bankName: "Test" }, admin.id);
    state = await db.order.findUniqueOrThrow({ where: { id: order.id }, include: { payments: true } });
    await submitReceiptBundle(order.id, "BALANCE", state.paymentRevision, ["/uploads/receipts/policy-b.webp"]);
    const balanceReceipt = await db.paymentReceipt.findFirstOrThrow({ where: { orderId: order.id, stage: "BALANCE" } });
    await reviewPaymentReceipt(balanceReceipt.id, true, admin.id, null);
    state = await db.order.findUniqueOrThrow({ where: { id: order.id }, include: { payments: true } });
    assert.equal(state.status, "CONFIRMED");
    assert.deepEqual(state.payments.map(p => Number(p.amount)).sort((a, b) => a - b), [251, 750]);
    await assert.rejects(db.order.create({ data: { orderNumber: `bad-percent-${suffix}`, customerName: "Bad", customerPhone: "09000000001", subtotal: 1000, totalAmount: 1000, shippingAddress: {}, twoStagePayment: true, depositPercent: 100 } }));
  } finally {
    if (before) { const { id, ...data } = before; await db.paymentPolicy.update({ where: { id }, data }); }
    else await db.paymentPolicy.deleteMany({ where: { id: "global" } });
    await db.auditLog.deleteMany({ where: { actorId: admin.id } });
    await db.order.deleteMany({ where: { id: { in: orders } } });
    await db.user.delete({ where: { id: admin.id } });
    await db.$disconnect();
  }
});

test("two-stage lifecycle: deposit, per-order destination, multi-image rejection/retry, final approval and safe cancellation", { skip: !url }, async () => {
  const db = getPrisma();
  const suffix = randomUUID();
  const admin = await db.user.create({ data: { phone: `staged-${suffix}`, role: "ADMIN" } });
  const category = await db.category.create({ data: { name: "Staged test", slug: `staged-${suffix}` } });
  const product = await db.product.create({ data: { name: "Staged", slug: `staged-${suffix}`, categoryId: category.id, metalType: "SILVER", price: 1001, stock: 5, status: "ACTIVE", inventory: { create: { quantity: 5, reserved: 2 } } } });
  const makeOrder = (label: string) => db.order.create({ data: {
    userId: admin.id, orderNumber: `${label}-${suffix}`, customerName: "Stage test", customerPhone: "09000000001", subtotal: 1001, totalAmount: 1001, shippingAddress: {}, twoStagePayment: true, depositPercent: 10,
    items: { create: { productId: product.id, productName: "Stage test", unitPrice: 1001, totalPrice: 1001, quantity: 1 } },
    payments: { create: [{ stage: "DEPOSIT", amount: 101, method: "CARD_TO_CARD", metadata: { cardNumber: "6037991234567891" } }, { stage: "BALANCE", amount: 900, method: "CARD_TO_CARD" }] }, shipment: { create: {} },
  } });
  const read = (id: string) => db.order.findUniqueOrThrow({ where: { id }, include: { payments: true, receipts: true } });
  const destination = { cardNumber: "6037991234567892", iban: "", cardHolder: "تست", bankName: "تست" };
  try {
    const a = await makeOrder("staged-a");
    const b = await makeOrder("staged-b");
    await assert.rejects(saveBalanceDestination(a.id, 0, destination, admin.id));
    await assert.rejects(submitReceiptBundle(a.id, "BALANCE", 0, ["/uploads/receipts/too-early.webp"]));
    await assert.rejects(submitReceiptBundle(a.id, "DEPOSIT", 0, []));
    await assert.rejects(submitReceiptBundle(a.id, "DEPOSIT", 0, Array.from({ length: 11 }, (_, i) => `/uploads/receipts/${i}.webp`)));
    await submitReceiptBundle(a.id, "DEPOSIT", 0, ["/uploads/receipts/d1.webp", "/uploads/receipts/d2.webp"]);
    await assert.rejects(submitReceiptBundle(a.id, "DEPOSIT", 0, ["/uploads/receipts/duplicate.webp"]));
    let state = await read(a.id);
    assert.equal(state.receipts.length, 2);
    await reviewPaymentReceipt(state.receipts[0].id, true, admin.id, null);
    await assert.rejects(reviewPaymentReceipt(state.receipts[0].id, true, admin.id, null));
    state = await read(a.id);
    assert.equal(state.status, "PENDING");
    assert.equal(state.receipts.filter(r => r.status === "APPROVED").length, 2);
    assert.equal(state.payments.find(p => p.stage === "DEPOSIT")?.status, "SUCCESS");
    assert.equal(state.payments.find(p => p.stage === "BALANCE")?.status, "PENDING");
    await assert.rejects(changeOrderStatus(a.id, "CONFIRMED", admin.id, "no bypass"));
    await assert.rejects(changeOrderStatus(a.id, "PROCESSING", admin.id, "no bypass"));
    await assert.rejects(submitReceiptBundle(a.id, "BALANCE", state.paymentRevision, ["/uploads/receipts/no-dest.webp"]));
    await saveBalanceDestination(a.id, state.paymentRevision, destination, admin.id);
    await assert.rejects(saveBalanceDestination(a.id, state.paymentRevision, destination, admin.id));
    assert.equal((await read(b.id)).payments.find(p => p.stage === "BALANCE")?.metadata, null);
    state = await read(a.id);
    const oldRevision = state.paymentRevision;
    await saveBalanceDestination(a.id, state.paymentRevision, { ...destination, cardNumber: "", iban: "IR062960000000100324200001" }, admin.id);
    await assert.rejects(submitReceiptBundle(a.id, "BALANCE", oldRevision, ["/uploads/receipts/old-dest.webp"]));
    state = await read(a.id);
    await submitReceiptBundle(a.id, "BALANCE", state.paymentRevision, ["/uploads/receipts/b1.webp", "/uploads/receipts/b2.webp", "/uploads/receipts/b3.webp"]);
    state = await read(a.id);
    await assert.rejects(saveBalanceDestination(a.id, state.paymentRevision, destination, admin.id));
    await reviewPaymentReceipt(state.receipts.find(r => r.stage === "BALANCE")!.id, false, admin.id, "Incomplete amount");
    state = await read(a.id);
    assert.equal(state.receipts.filter(r => r.stage === "BALANCE" && r.status === "REJECTED").length, 3);
    assert.equal(state.payments.find(p => p.stage === "DEPOSIT")?.status, "SUCCESS");
    await submitReceiptBundle(a.id, "BALANCE", state.paymentRevision, ["/uploads/receipts/retry1.webp", "/uploads/receipts/retry2.webp"]);
    state = await read(a.id);
    await reviewPaymentReceipt(state.receipts.find(r => r.stage === "BALANCE" && r.status === "PENDING")!.id, true, admin.id, "Full settlement");
    state = await read(a.id);
    assert.equal(state.status, "CONFIRMED");
    assert.ok(state.payments.every(p => p.status === "SUCCESS"));
    assert.equal(state.payments.reduce((sum, p) => sum + Number(p.amount), 0), 1001);
    await assert.rejects(saveBalanceDestination(a.id, state.paymentRevision, destination, admin.id));
    await assert.rejects(submitReceiptBundle(a.id, "BALANCE", state.paymentRevision, ["/uploads/receipts/after-final.webp"]));
    await changeOrderStatus(a.id, "PROCESSING", admin.id, "paid");
    await changeOrderStatus(a.id, "SHIPPED", admin.id, "paid");
    await changeOrderStatus(a.id, "SHIPPED", admin.id, "idempotent");
    assert.equal((await db.inventory.findUniqueOrThrow({ where: { productId: product.id } })).reserved, 1);
    await submitReceiptBundle(b.id, "DEPOSIT", 0, ["/uploads/receipts/cancel-deposit.webp"]);
    const pendingB = await read(b.id);
    await reviewPaymentReceipt(pendingB.receipts[0].id, true, admin.id, null);
    await db.order.update({ where: { id: b.id }, data: { createdAt: new Date(Date.now() - 25 * 3600_000) } });
    await expireUnpaidOrders();
    assert.equal((await read(b.id)).status, "PENDING", "paid deposit cannot auto-expire");
    await changeOrderStatus(b.id, "CANCELLED", admin.id, "refund requires manual handling");
    await changeOrderStatus(b.id, "CANCELLED", admin.id, "repeat");
    const cancelled = await read(b.id);
    assert.equal(cancelled.payments.find(p => p.stage === "DEPOSIT")?.status, "SUCCESS", "do not erase received money");
    assert.equal(cancelled.payments.find(p => p.stage === "BALANCE")?.status, "CANCELLED");
    assert.equal((await db.inventory.findUniqueOrThrow({ where: { productId: product.id } })).reserved, 0);
    assert.ok(await db.auditLog.count({ where: { actorId: admin.id, action: "RECEIPT_BUNDLE_REVIEW" } }) >= 4);
  } finally {
    await db.auditLog.deleteMany({ where: { actorId: admin.id } });
    await db.order.deleteMany({ where: { userId: admin.id } });
    await db.product.delete({ where: { id: product.id } });
    await db.category.delete({ where: { id: category.id } });
    await db.user.delete({ where: { id: admin.id } });
    await db.$disconnect();
  }
});
