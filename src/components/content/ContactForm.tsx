"use client";
import { Button, Input, Textarea, ToastProvider, useToast } from "@/components/ui";

/** فرم تماس نمایشی؛ پیام را فقط در Toast محلی نشان می‌دهد. */
function ContactFormContent() {
  const { push } = useToast();
  return (
    <form
      className="space-y-4"
      onSubmit={(e) => {
        e.preventDefault();
        push({
          title: "پیام ثبت شد",
          description: "در نسخه نهایی این پیام برای پشتیبانی ارسال می‌شود.",
          tone: "success",
        });
      }}
    >
      <div>
        <label htmlFor="contact-name">نام و نام خانوادگی</label>
        <Input id="contact-name" autoComplete="name" />
      </div>
      <div>
        <label htmlFor="contact-email">ایمیل</label>
        <Input id="contact-email" type="email" autoComplete="email" dir="ltr" />
      </div>
      <div>
        <label htmlFor="contact-message">متن پیام</label>
        <Textarea id="contact-message" rows={6} />
      </div>
      <Button type="submit">ارسال پیام</Button>
    </form>
  );
}
export function ContactForm() {
  return (
    <ToastProvider>
      <ContactFormContent />
    </ToastProvider>
  );
}
