"use client";
import { useActionState, useState } from "react";
import { formatMoney } from "@/lib/format-money";
import { Button, Input, Textarea } from "@/components/ui";
import { checkoutAction, type CheckoutState } from "@/app/actions/checkout";
import { paymentPlan, matchesPaymentRange, type PaymentPolicyValues } from "@/lib/payment-policy";
import { quoteCheckoutCoupon } from "@/app/actions/checkout-quote";

const initialState: CheckoutState = {};

export interface PaymentMethodOption {
  id: string;
  name: string;
  type: string;
  description: string | null;
  cardNumber: string | null;
  cardHolder: string | null;
  bankName: string | null;
  requiresReceipt: boolean;
  minimumAmount: number;
  maximumAmount: number | null;
}
export interface ShippingMethodOption {
  id: string;
  name: string;
  description: string | null;
  cost: number;
}

const fmt = formatMoney;

/** فرم تکمیل سفارش — اطلاعات آدرس، ارسال و پرداخت. */
export function CheckoutForm({
  paymentMethods,
  shippingMethods,
  subtotal,
  policy,
}: {
  paymentMethods: PaymentMethodOption[];
  shippingMethods: ShippingMethodOption[];
  subtotal: number;
  policy: PaymentPolicyValues;
}) {
  const [state, formAction, isPending] = useActionState(checkoutAction, initialState);
  const [shippingId, setShippingId] = useState(shippingMethods[0]?.id ?? "");
  const [paymentId, setPaymentId] = useState(paymentMethods[0]?.id ?? "");
  const [coupon, setCoupon] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState("");
  const [discount, setDiscount] = useState(0);
  const [freeShipping, setFreeShipping] = useState(false);
  const [quotePending, setQuotePending] = useState(false);
  const [couponError, setCouponError] = useState("");
  const [couponMessage, setCouponMessage] = useState("");
  const shippingCost = freeShipping ? 0 : shippingMethods.find((m) => m.id === shippingId)?.cost ?? 0;
  const total = subtotal - discount + shippingCost;
  const availableMethods = paymentMethods.filter(method => matchesPaymentRange(total, method));
  const selectedPayment = availableMethods.find(m => m.id === paymentId) ?? availableMethods[0];
  const plan = total > 0 ? paymentPlan(total, policy) : null;
  const couponDirty = coupon.trim() !== appliedCoupon;
  async function applyCoupon() {
    setQuotePending(true);
    setCouponError("");
    setCouponMessage("");
    try {
      const result = await quoteCheckoutCoupon(coupon.trim());
      if ("error" in result) { setCouponError(result.error ?? "کد معتبر نیست."); return; }
      setDiscount(result.discount);
      setFreeShipping(result.freeShipping);
      setAppliedCoupon(coupon.trim());
      setCouponMessage(coupon.trim() ? "کد تخفیف اعمال شد؛ روش پرداخت و مبلغ‌ها به‌روز شدند." : "تخفیف حذف شد.");
    } catch { setCouponError("ارتباط برقرار نشد؛ دوباره تلاش کنید."); }
    finally { setQuotePending(false); }
  }

  return (
    <form className="checkout-form" action={formAction}>
      <input type="hidden" name="paymentQuote" value={JSON.stringify({ total, percent: plan?.depositPercent ?? null, revision: policy.revision })} />
      {state.error && (
        <div className="checkout-error" role="alert" style={{ color: "#ff6b6b", padding: "12px", borderRadius: "8px", background: "rgba(255,107,107,0.1)", border: "1px solid rgba(255,107,107,0.3)" }}>
          {state.error}
        </div>
      )}

      <fieldset className="checkout-fieldset">
        <legend>اطلاعات تماس</legend>
        <div className="form-group">
          <label htmlFor="checkout-name">نام و نام خانوادگی</label>
          <Input name="name" id="checkout-name" required />
        </div>
        <div className="form-group">
          <label htmlFor="checkout-phone">شماره موبایل</label>
          <Input name="phone" id="checkout-phone" type="tel" inputMode="numeric" placeholder="09xxxxxxxxx" required />
        </div>
        <div className="form-group">
          <label htmlFor="checkout-email">ایمیل (اختیاری)</label>
          <Input name="email" id="checkout-email" type="email" dir="ltr" />
        </div>
      </fieldset>

      <fieldset className="checkout-fieldset">
        <legend>آدرس ارسال</legend>
        <div className="form-group">
          <label htmlFor="checkout-province">استان</label>
          <Input name="province" id="checkout-province" required />
        </div>
        <div className="form-group">
          <label htmlFor="checkout-city">شهر</label>
          <Input name="city" id="checkout-city" required />
        </div>
        <div className="form-group">
          <label htmlFor="checkout-address">آدرس کامل</label>
          <Textarea name="address" id="checkout-address" rows={3} required />
        </div>
        <div className="form-group">
          <label htmlFor="checkout-postal">کد پستی</label>
          <Input name="postalCode" id="checkout-postal" inputMode="numeric" dir="ltr" />
        </div>
      </fieldset>

      <fieldset className="checkout-fieldset">
        <legend>روش ارسال</legend>
        <input type="hidden" name="shippingMethodId" value={shippingId} />
        {shippingMethods.length === 0 && <p className="checkout-hint">روش ارسالی تنظیم نشده است.</p>}
        <div className="payment-methods">
          {shippingMethods.map((m) => (
            <label key={m.id} className={`payment-method${shippingId === m.id ? " selected" : ""}`}>
              <input type="radio" name="shippingRadio" value={m.id} checked={shippingId === m.id} onChange={() => setShippingId(m.id)} />
              <span className="method-body">
                <span className="method-title">{m.name}</span>
                {m.description && <span className="method-desc">{m.description}</span>}
              </span>
              <span className="method-cost">{m.cost === 0 ? "رایگان" : `${fmt(m.cost)} تومان`}</span>
            </label>
          ))}
        </div>
      </fieldset>

      <fieldset className="checkout-fieldset">
        <legend>کد تخفیف</legend>
        <div className="form-group">
          <label htmlFor="coupon">کد تخفیف (اختیاری)</label>
          <Input name="coupon" id="coupon" dir="ltr" placeholder="مثلاً WELCOME10" value={coupon} onChange={event => setCoupon(event.target.value)} disabled={quotePending || isPending} maxLength={100} />
          <Button type="button" variant="secondary" onClick={applyCoupon} disabled={quotePending || isPending}>{quotePending ? "در حال بررسی…" : "اعمال / حذف تخفیف و محاسبهٔ پرداخت"}</Button>
          {couponDirty && <p>برای به‌روزرسانی مبلغ و روش پرداخت، ابتدا دکمهٔ اعمال / حذف تخفیف را بزنید.</p>}
          {couponError && <p role="alert" className="text-red-400">{couponError}</p>}
          {couponMessage && <p role="status">{couponMessage}</p>}
        </div>
      </fieldset>

      <fieldset className="checkout-fieldset">
        <legend>روش پرداخت</legend>
        <input type="hidden" name="paymentMethodId" value={selectedPayment?.id ?? ""} />
        {policy.twoStageEnabled && <p className="checkout-hint">کمتر از {fmt(policy.thresholdAmount)} تومان: پرداخت کامل؛ از این مبلغ به بالا: {policy.depositPercent.toLocaleString("fa-IR")}٪ پیش‌پرداخت و تسویهٔ مانده پس از تأیید اولیه. مبنا جمع نهایی با ارسال و پس از تخفیف است.</p>}
        {availableMethods.length === 0 && <p role="alert" className="checkout-hint">برای مبلغ نهایی این سفارش روش پرداخت فعالی وجود ندارد؛ با پشتیبانی تماس بگیرید.</p>}
        <div className="payment-methods">
          {availableMethods.map((m) => (
            <label key={m.id} className={`payment-method${selectedPayment?.id === m.id ? " selected" : ""}`}>
              <input type="radio" name="paymentRadio" value={m.id} checked={selectedPayment?.id === m.id} onChange={() => setPaymentId(m.id)} />
              <span className="method-body">
                <span className="method-title">{m.name} — {plan?.twoStage ? `پیش‌پرداخت ${policy.depositPercent.toLocaleString("fa-IR")}٪` : "پرداخت کامل"}</span>
                {m.description && <span className="method-desc">{m.description}</span>}
              </span>
            </label>
          ))}
        </div>

        {selectedPayment?.cardNumber && (
          <div className="card-info-box">
            <p className="card-info-title">{plan?.twoStage ? `کارت مرحلهٔ اول — فقط پیش‌پرداخت ${policy.depositPercent.toLocaleString("fa-IR")}٪` : "کارت واریز مبلغ کامل سفارش"}</p>
            <p className="card-info-number" dir="ltr">{selectedPayment.cardNumber}</p>
            {selectedPayment.cardHolder && <p className="card-info-line">به نام: {selectedPayment.cardHolder}</p>}
            {selectedPayment.bankName && <p className="card-info-line">بانک: {selectedPayment.bankName}</p>}
            <p className="card-info-hint">{plan?.twoStage ? `پس از ایجاد درخواست، فقط ${policy.depositPercent.toLocaleString("fa-IR")}٪ را واریز و تمام تصاویر فیش‌ها را ارسال کنید. پس از تأیید اولیه، مقصد اختصاصی مانده توسط مدیر اعلام می‌شود.` : "پس از ثبت سفارش، تمام مبلغ را به این کارت واریز و تمام تصاویر فیش‌ها را ارسال کنید. سفارش پس از بررسی وصول مبلغ کامل توسط مدیر تأیید می‌شود."} پیش از ثبت سفارش و نمایش مبلغ قطعی واریز نکنید.</p>
          </div>
        )}
      </fieldset>

      <fieldset className="checkout-fieldset">
        <legend>یادداشت سفارش</legend>
        <Textarea name="note" rows={3} />
      </fieldset>

      <div role="status" className="card-info-box space-y-2"><p>تخفیف: {fmt(discount)} تومان — ارسال: {fmt(shippingCost)} تومان</p><p>جمع نهایی: {fmt(total)} تومان</p>
      {plan?.twoStage ? <p>پیش‌پرداخت {policy.depositPercent.toLocaleString("fa-IR")}٪: {fmt(plan.deposit)} تومان؛ مانده: {fmt(plan.balance)} تومان.</p> : <p>پرداخت کامل در یک مرحله: {fmt(total)} تومان</p>}</div>
      <Button type="submit" className="btn btn-primary w-full" disabled={isPending || quotePending || couponDirty || !plan || availableMethods.length === 0 || shippingMethods.length === 0}>
        {isPending ? "در حال ایجاد درخواست..." : plan?.twoStage ? `ایجاد درخواست و پرداخت ${policy.depositPercent.toLocaleString("fa-IR")}٪` : "ثبت سفارش و پرداخت کامل"}
      </Button>
    </form>
  );
}
