"use client";
import { useActionState } from "react";
import { Button, Input, Textarea } from "@/components/ui";
import { contactAction, type ContactState } from "@/app/actions/contact";
export function ContactForm() {
  const [state, action, pending] = useActionState(contactAction, {} as ContactState);
  return <form action={action} className="space-y-4">
    {state.error && <p role="alert">{state.error}</p>}
    {state.success && <p role="status">پیام شما ثبت شد و در پنل پشتیبانی قابل مشاهده است.</p>}
    <label htmlFor="contact-name">نام و نام خانوادگی</label><Input name="name" id="contact-name" required maxLength={120} autoComplete="name" />
    <label htmlFor="contact-email">ایمیل</label><Input name="email" id="contact-email" required maxLength={200} type="email" autoComplete="email" dir="ltr" />
    <label htmlFor="contact-message">متن پیام</label><Textarea name="message" id="contact-message" required minLength={10} maxLength={5000} rows={6} />
    <Button type="submit" disabled={pending}>{pending ? "در حال ارسال..." : "ارسال پیام"}</Button>
  </form>;
}
