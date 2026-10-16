"use client";

import { useActionState } from "react";
import { saveDestinationAction, reviewBundleAction, type PaymentActionState } from "@/app/actions/staged-payment";
import { Button, Input } from "@/components/ui";

const initial: PaymentActionState = {};
export function DestinationForm({ orderId, revision, destination, locked }: { orderId: string; revision: number; destination: { cardNumber: string; iban: string; cardHolder: string; bankName: string }; locked: boolean }) {
  const [state, action, pending] = useActionState(saveDestinationAction, initial);
  return <form action={action} className="grid gap-3 mt-4">
    <input type="hidden" name="orderId" value={orderId} /><input type="hidden" name="revision" value={revision} />
    <p>این اطلاعات فقط برای تسویهٔ همین سفارش است و کارت پیش‌پرداخت و سفارش‌های دیگر را تغییر نمی‌دهد. حداقل کارت یا شبا و نام صاحب حساب لازم است.</p>
    {locked && <p>تا بررسی رسیدهای در انتظار، مقصد قابل تغییر نیست.</p>}
    <label>شماره کارت<Input name="cardNumber" dir="ltr" defaultValue={destination.cardNumber} disabled={locked || pending} placeholder="۱۶ رقم" /></label>
    <label>شماره شبا<Input name="iban" dir="ltr" defaultValue={destination.iban} disabled={locked || pending} placeholder="IR…" /></label>
    <label>نام صاحب حساب<Input name="cardHolder" defaultValue={destination.cardHolder} required maxLength={120} disabled={locked || pending} /></label>
    <label>نام بانک<Input name="bankName" defaultValue={destination.bankName} maxLength={100} disabled={locked || pending} /></label>
    {state.error && <p role="alert" className="text-red-400">{state.error}</p>}{state.success && <p role="status">{state.success}</p>}
    <Button type="submit" disabled={locked || pending}>{pending ? "در حال ذخیره…" : "اعلام یا تغییر مقصد تسویهٔ این سفارش"}</Button>
  </form>;
}

export function ReviewBundleForm({ receiptId, deposit, count }: { receiptId: string; deposit: boolean; count: number }) {
  const [state, action, pending] = useActionState(reviewBundleAction, initial);
  return <form action={action} className="grid gap-3 mt-4">
    <input type="hidden" name="id" value={receiptId} />
    <p>تصمیم شما روی تمام {count.toLocaleString("fa-IR")} تصویر در انتظارِ این مرحله اعمال می‌شود. پیش از تأیید، وصول وجه و جمع تمام واریزها را با مبلغ این مرحله تطبیق دهید.</p>
    <label>توضیح بررسی (برای رد الزامی)<Input name="note" maxLength={500} placeholder="دلیل رد یا توضیح تأیید" /></label>
    {state.error && <p role="alert" className="text-red-400">{state.error}</p>}{state.success && <p role="status">{state.success}</p>}
    <Button type="submit" name="decision" value="approve" disabled={pending}>{deposit ? "تأیید اولیهٔ پیش‌پرداخت" : "تأیید نهایی و تسویهٔ سفارش"}</Button>
    <Button type="submit" name="decision" value="reject" variant="danger" disabled={pending}>رد مجموعه رسیدهای این مرحله</Button>
  </form>;
}
