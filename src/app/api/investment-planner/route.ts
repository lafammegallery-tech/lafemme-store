import { NextResponse } from "next/server";
import { productRepository } from "@/backend/database/repositories/product.repository";
import { getStorefrontProducts } from "@/backend/services/storefront-product.service";
import { buildInvestmentPlans, eligibleInvestmentProducts, MAX_INVESTMENT_BUDGET } from "@/lib/investment-planner";
import type { InvestmentMode, InvestmentProduct } from "@/lib/investment-planner";
import { isAllowedRequestOrigin } from "@/backend/security/request-origin";
import { assertRateLimit } from "@/backend/security/rate-limit";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  if (!isAllowedRequestOrigin(request.headers)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  if (Number(request.headers.get("content-length")) > 256) return NextResponse.json({ error: "درخواست بیش از حد بزرگ است." }, { status: 413 });
  try {
    assertRateLimit(`investment:${request.headers.get("x-forwarded-for")?.split(",")[0]?.trim().slice(0, 80) || "local"}`, 30, 60_000);
  } catch {
    return NextResponse.json({ error: "تعداد درخواست‌ها زیاد است؛ یک دقیقه بعد تلاش کنید." }, { status: 429 });
  }
  let body;
  try {
    const text = await request.text();
    if (text.length > 256) return NextResponse.json({ error: "درخواست بیش از حد بزرگ است." }, { status: 413 });
    body = JSON.parse(text);
  } catch {
    return NextResponse.json({ error: "فرمت درخواست معتبر نیست." }, { status: 400 });
  }
  try {
    const { budget, mode } = body ?? {};
    if (!Number.isSafeInteger(budget) || budget <= 0 || budget > MAX_INVESTMENT_BUDGET || !["gold", "silver", "mixed"].includes(mode)) {
      return NextResponse.json({ error: "بودجه را به تومان و به‌صورت عدد صحیح معتبر وارد کنید." }, { status: 400 });
    }
    // Never recommend mock/fallback records or products without reservable inventory.
    const [rows, priced] = await Promise.all([productRepository.findAllActive(), getStorefrontProducts()]);
    const catalog: InvestmentProduct[] = rows.flatMap(row => {
      const product = priced.find(p => p.id === row.id);
      if (!product?.isLivePrice || !row.inventory || !["GOLD", "SILVER"].includes(row.metalType)) return [];
      return [{ id: product.id, name: product.name, href: product.href, imageSrc: product.imageSrc,
        type: product.type, price: product.price, weightValue: product.weightValue, purity: product.purity,
        stock: Math.max(0, row.inventory.quantity - row.inventory.reserved) }];
    });
    const eligible = eligibleInvestmentProducts(catalog, mode as InvestmentMode);
    const plans = buildInvestmentPlans(eligible, budget, mode as InvestmentMode);
    const minimum = eligible.length ? Math.min(...eligible.map(p => p.price)) : null;
    const message = !eligible.length ? "در این حالت، شمش موجود با قیمت معتبر در دسترس نیست. کمی بعد دوباره تلاش کنید."
      : !plans.length ? "بودجهٔ شما از قیمت ارزان‌ترین شمش موجود در این حالت کمتر است." : undefined;
    return NextResponse.json({ plans, minimum, message, calculatedAt: new Date().toISOString() }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    console.error("[investment-planner] calculation failed", error instanceof Error ? error.message : "unknown");
    return NextResponse.json({ error: "محاسبه فعلاً در دسترس نیست؛ لطفاً کمی بعد دوباره تلاش کنید." }, { status: 503 });
  }
}
