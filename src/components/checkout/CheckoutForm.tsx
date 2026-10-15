"use client";
import { useActionState, useState } from "react";
import { formatMoney } from "@/lib/format-money";
import { Button, Input, Textarea } from "@/components/ui";
import { checkoutAction, type CheckoutState } from "@/app/actions/checkout";

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
}: {
  paymentMethods: PaymentMethodOption[];
  shippingMethods: ShippingMethodOption[];
  subtotal: number;
}) {
  const [state, formAction, isPending] = useActionState(checkoutAction, initialState);
  const [shippingId, setShippingId] = useState(shippingMethods[0]?.id ?? "");
  const [paymentId, setPaymentId] = useState(paymentMethods[0]?.id ?? "");

  const selectedPayment = paymentMethods.find((m) => m.id === paymentId);
  const shippingCost = shippingMethods.find((m) => m.id === shippingId)?.cost ?? 0;

  return (
    <form className="checkout-form" action={formAction}>
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
          <Input name="coupon" id="coupon" dir="ltr" placeholder="مثلاً WELCOME10" />
        </div>
      </fieldset>

      <fieldset className="checkout-fieldset">
        <legend>روش پرداخت</legend>
        <input type="hidden" name="paymentMethodId" value={paymentId} />
        {paymentMethods.length === 0 && <p className="checkout-hint">روش پرداختی تنظیم نشده است.</p>}
        <div className="payment-methods">
          {paymentMethods.map((m) => (
            <label key={m.id} className={`payment-method${paymentId === m.id ? " selected" : ""}`}>
              <input type="radio" name="paymentRadio" value={m.id} checked={paymentId === m.id} onChange={() => setPaymentId(m.id)} />
              <span className="method-body">
                <span className="method-title">{m.name}</span>
                {m.description && <span className="method-desc">{m.description}</span>}
              </span>
            </label>
          ))}
        </div>

        {selectedPayment?.cardNumber && (
          <div className="card-info-box">
            <p className="card-info-title">اطلاعات کارت برای واریز</p>
            <p className="card-info-number" dir="ltr">{selectedPayment.cardNumber}</p>
            {selectedPayment.cardHolder && <p className="card-info-line">به نام: {selectedPayment.cardHolder}</p>}
            {selectedPayment.bankName && <p className="card-info-line">بانک: {selectedPayment.bankName}</p>}
            {selectedPayment.requiresReceipt && (
              <p className="card-info-hint">پس از ثبت سفارش، تصویر رسید واریز را بارگذاری کنید تا سفارش تأیید شود.</p>
            )}
          </div>
        )}
      </fieldset>

      <fieldset className="checkout-fieldset">
        <legend>یادداشت سفارش</legend>
        <Textarea name="note" rows={3} />
      </fieldset>

      <p role="status">جمع با ارسال: {fmt(subtotal + shippingCost)} تومان (تخفیف معتبر هنگام ثبت سفارش اعمال می‌شود)</p>
      <Button type="submit" className="btn btn-primary w-full" disabled={isPending || paymentMethods.length === 0 || shippingMethods.length === 0}>
        {isPending ? "در حال ثبت سفارش..." : "ثبت سفارش"}
      </Button>
    </form>
  );
}
