"use server";

import { getSession } from "@/backend/auth/session";
import { getCurrentCart } from "@/backend/services/cart.service";
import { evaluateCoupon } from "@/backend/services/coupon.service";
import { assertRateLimit } from "@/backend/security/rate-limit";

export async function quoteCheckoutCoupon(code: string) {
  try {
    const [session, cart] = await Promise.all([getSession(), getCurrentCart()]);
    if (!cart?.items.length) throw new Error("سبد خرید خالی است.");
    assertRateLimit(`checkout-quote:${cart.id}`, 30, 60_000);
    if (typeof code !== "string" || code.length > 100) throw new Error("کد تخفیف معتبر نیست.");
    const subtotal = cart.items.reduce((sum, item) => sum + Number(item.unitPrice) * item.quantity, 0);
    const applied = await evaluateCoupon(code, subtotal, session?.userId);
    if (code.trim() && !applied) throw new Error("کد تخفیف معتبر یا قابل استفاده نیست.");
    return { discount: applied?.discount ?? 0, freeShipping: applied?.freeShipping ?? false };
  } catch (error) { return { error: error instanceof Error ? error.message : "بررسی تخفیف انجام نشد." }; }
}
