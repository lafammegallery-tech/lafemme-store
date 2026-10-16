"use client";

import { useActionState, useState } from "react";
import { useRouter } from "next/navigation";
import { saveDestinationAction, type PaymentActionState } from "@/app/actions/staged-payment";
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
  const router = useRouter();
  const [note, setNote] = useState("");
  const [apiState, setApiState] = useState<PaymentActionState>({});
  const [apiPending, setApiPending] = useState(false);
  async function review(decision: "approve" | "reject") {
    if (decision === "reject" && !note.trim()) return setApiState({ error: "دلیل رد را بنویسید تا مشتری بتواند اصلاح کند." });
    setApiPending(true); setApiState({});
    try {
      const response = await fetch("/api/admin/payment-receipts/review", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: receiptId, decision, note }) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error ?? "بررسی انجام نشد.");
      setApiState({ success: data.message }); router.refresh();
    } catch (error) { setApiState({ error: error instanceof Error ? error.message : "بررسی انجام نشد." }); }
    finally { setApiPending(false); }
  }
  return <div className="grid gap-3 mt-4">
    <p>تصمیم شما روی تمام {count.toLocaleString("fa-IR")} تصویر در انتظارِ این مرحله اعمال می‌شود. پیش از تأیید، وصول وجه و جمع تمام واریزها را با مبلغ این مرحله تطبیق دهید.</p>
    <label>توضیح بررسی (برای رد الزامی)<Input value={note} onChange={event => setNote(event.target.value)} disabled={apiPending} maxLength={500} placeholder="دلیل رد یا توضیح تأیید" /></label>
    {apiState.error && <p role="alert" className="text-red-400">{apiState.error}</p>}{apiState.success && <p role="status">{apiState.success}</p>}
    <Button type="button" onClick={() => review("approve")} disabled={apiPending}>{apiPending ? "در حال بررسی…" : deposit ? "تأیید اولیهٔ پیش‌پرداخت" : "تأیید نهایی و تسویهٔ سفارش"}</Button>
    <Button type="button" onClick={() => review("reject")} variant="danger" disabled={apiPending}>رد مجموعه رسیدهای این مرحله</Button>
  </div>;
}
