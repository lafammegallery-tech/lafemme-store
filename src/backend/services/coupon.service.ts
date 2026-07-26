import { getPrisma } from "@/backend/database/prisma";

export async function evaluateCoupon(code: string, subtotal: number, userId?: string) {
  if (!code) return null;

  const prisma = getPrisma();
  const coupon = await prisma.coupon.findUnique({
    where: { code: code.trim().toUpperCase() },
    include: { _count: { select: { usages: true } } },
  });

  const now = new Date();
  if (
    !coupon ||
    !coupon.isActive ||
    (coupon.startsAt && coupon.startsAt > now) ||
    (coupon.expiresAt && coupon.expiresAt < now) ||
    Number(coupon.minimumAmount) > subtotal
  ) {
    return null;
  }

  if (coupon.usageLimit && coupon._count.usages >= coupon.usageLimit) return null;

  if (userId) {
    const used = await prisma.couponUsage.count({ where: { couponId: coupon.id, userId } });
    if (used >= coupon.perUserLimit) return null;
  }

  let discount = 0;
  let freeShipping = false;
  if (coupon.type === "PERCENT") discount = Math.floor((subtotal * Number(coupon.value)) / 100);
  if (coupon.type === "FIXED") discount = Number(coupon.value);
  if (coupon.type === "FREE_SHIPPING") freeShipping = true;
  if (coupon.maximumDiscount) discount = Math.min(discount, Number(coupon.maximumDiscount));
  discount = Math.min(discount, subtotal);

  return { coupon, discount, freeShipping };
}
