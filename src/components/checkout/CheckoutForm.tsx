"use client";
import { useActionState } from "react";
import { Button, Input, Textarea } from "@/components/ui";
import { checkoutAction, type CheckoutState } from "@/app/actions/checkout";

const initialState: CheckoutState = {};

/** فرم تکمیل سفارش — اطلاعات آدرس و پرداخت. */
export function CheckoutForm() {
  const [state, formAction, isPending] = useActionState(checkoutAction, initialState);

  return (
    <form className="checkout-form" action={formAction}>
      {/* نمایش خطای سرور */}
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
        <legend>کد تخفیف</legend>
        <div className="form-group">
          <label htmlFor="coupon">کد تخفیف (اختیاری)</label>
          <Input name="coupon" id="coupon" dir="ltr" placeholder="مثلاً WELCOME10" />
        </div>
      </fieldset>

      <fieldset className="checkout-fieldset">
        <legend>روش پرداخت</legend>
        <label className="payment-method selected">
          <input type="radio" name="paymentMethod" value="online" defaultChecked />
          <span>پرداخت آنلاین</span>
        </label>
      </fieldset>

      <fieldset className="checkout-fieldset">
        <legend>یادداشت سفارش</legend>
        <Textarea name="note" rows={3} />
      </fieldset>

      <Button type="submit" className="btn btn-primary w-full" disabled={isPending}>
        {isPending ? "در حال ثبت سفارش..." : "ثبت سفارش"}
      </Button>
    </form>
  );
}
