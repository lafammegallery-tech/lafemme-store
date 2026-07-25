"use client";
import { Button, Input, ToastProvider, useToast } from "@/components/ui";

/** فرم نمایشی پروفایل؛ فقط Toast محلی نمایش می‌دهد. */
function ProfileFormContent() {
  const { push } = useToast();
  return (
    <form
      className="grid gap-4 md:grid-cols-2"
      onSubmit={(e) => {
        e.preventDefault();
        push({ title: "اطلاعات ذخیره شد", description: "این پیام نمایشی است.", tone: "success" });
      }}
    >
      <div>
        <label htmlFor="profile-name">نام و نام خانوادگی</label>
        <Input id="profile-name" defaultValue="کاربر نمونه" />
      </div>
      <div>
        <label htmlFor="profile-phone">شماره موبایل</label>
        <Input id="profile-phone" defaultValue="09120000000" dir="ltr" />
      </div>
      <div className="md:col-span-2">
        <label htmlFor="profile-email">ایمیل</label>
        <Input id="profile-email" type="email" defaultValue="user@example.com" dir="ltr" />
      </div>
      <Button type="submit">ذخیره تغییرات</Button>
    </form>
  );
}
export function ProfileForm() {
  return (
    <ToastProvider>
      <ProfileFormContent />
    </ToastProvider>
  );
}
