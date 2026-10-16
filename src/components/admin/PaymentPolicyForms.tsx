"use client";

import { useActionState, useState } from "react";
import { Button, Input, Badge } from "@/components/ui";
import { savePaymentPolicyAction, savePaymentRangeAction, type PaymentSettingsState } from "@/app/actions/payment-policy";
import { formatMoney } from "@/lib/format-money";
import type { PaymentPolicyValues, PaymentAmountRange } from "@/lib/payment-policy";

const initial: PaymentSettingsState = {};

export function PaymentPolicyForm({ policy }: { policy: PaymentPolicyValues }) {
  const [state, action, pending] = useActionState(savePaymentPolicyAction, initial);
  const [enabled, setEnabled] = useState(policy.twoStageEnabled);
  return <form action={action} className="grid gap-4">
    <input type="hidden" name="revision" value={policy.revision} />
    <div className="flex flex-wrap items-center gap-3"><h2 className="admin-form-title">قانون پرداخت بر اساس مبلغ سفارش</h2><Badge tone={policy.twoStageEnabled ? "success" : "neutral"}>{policy.twoStageEnabled ? "پیش‌پرداخت فعال" : "پیش‌پرداخت غیرفعال"}</Badge></div>
    <label className="admin-checkbox"><input type="checkbox" name="twoStageEnabled" checked={enabled} onChange={event => setEnabled(event.target.checked)} /><span>فعال‌بودن پرداخت دومرحله‌ای برای سفارش‌های بزرگ</span></label>
    <div className="grid gap-4 sm:grid-cols-2">
      <label htmlFor="payment-threshold">شروع پیش‌پرداخت از مبلغ (تومان)<Input id="payment-threshold" name="thresholdAmount" inputMode="numeric" defaultValue={policy.thresholdAmount} required dir="ltr" /><span className="admin-item-sub">مساوی این مبلغ و بالاتر: دومرحله‌ای. صفر: تمام سفارش‌ها دومرحله‌ای.</span></label>
      <label htmlFor="payment-percent">درصد پیش‌پرداخت<Input id="payment-percent" name="depositPercent" inputMode="numeric" defaultValue={policy.depositPercent} required dir="ltr" /><span className="admin-item-sub">عدد صحیح از ۱ تا ۹۹؛ مانده در مرحلهٔ دوم تسویه می‌شود.</span></label>
    </div>
    <div className="rounded-xl border border-lf-border p-4 space-y-2">
      <p>قانون ذخیره‌شده: {policy.twoStageEnabled ? <>کمتر از {formatMoney(policy.thresholdAmount)} تومان، پرداخت کامل؛ از این مبلغ به بالا، {policy.depositPercent.toLocaleString("fa-IR")}٪ پیش‌پرداخت و سپس تسویهٔ مانده.</> : "پیش‌پرداخت غیرفعال است و همهٔ سفارش‌های جدید پرداخت کامل دارند."}</p>
      <p className="admin-item-sub">مبنای بازه‌ها، جمع نهایی پس از تخفیف و با هزینهٔ ارسال است. مبالغ و درصد سفارش‌های قبلی تغییر نمی‌کند. خاموش‌کردن پیش‌پرداخت، پرداخت کامل را جایگزین می‌کند؛ فعال‌بودن یک روش کارت‌به‌کارت معتبر همچنان لازم است.</p>
    </div>
    {state.error && <p role="alert" className="text-red-400">{state.error}</p>}{state.success && <p role="status">{state.success}</p>}
    <Button type="submit" disabled={pending}>{pending ? "در حال ذخیره…" : "ذخیرهٔ قانون پرداخت"}</Button>
  </form>;
}

export function PaymentRangeForm({ id, range }: { id: string; range: PaymentAmountRange }) {
  const [state, action, pending] = useActionState(savePaymentRangeAction, initial);
  return <form action={action} className="mt-4 grid gap-3 border-t border-lf-border pt-4">
    <input type="hidden" name="id" value={id} />
    <p>بازهٔ مبلغ مجاز این روش (تومان)</p>
    <div className="grid gap-3 sm:grid-cols-2">
      <label>از مبلغ (شامل این عدد)<Input name="minimumAmount" inputMode="numeric" defaultValue={range.minimumAmount} required dir="ltr" /></label>
      <label>تا قبل از مبلغ (خالی = نامحدود)<Input name="maximumAmount" inputMode="numeric" defaultValue={range.maximumAmount ?? ""} dir="ltr" /></label>
    </div>
    {state.error && <p role="alert" className="text-red-400">{state.error}</p>}{state.success && <p role="status">{state.success}</p>}
    <Button type="submit" variant="secondary" size="sm" disabled={pending}>{pending ? "در حال ذخیره…" : "ذخیرهٔ بازهٔ مبلغ"}</Button>
  </form>;
}
