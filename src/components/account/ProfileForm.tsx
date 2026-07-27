"use client";
import { useActionState, useEffect } from "react";
import { Button, Input, ToastProvider, useToast } from "@/components/ui";
import { updateProfileAction, type ProfileState } from "@/app/actions/profile";

export interface ProfileFormProps {
  name: string;
  phone: string;
  email: string;
}

const initialState: ProfileState = {};

/** فرم واقعی پروفایل — مقادیر فعلی کاربر را نمایش و در دیتابیس ذخیره می‌کند. */
function ProfileFormContent({ name, phone, email }: ProfileFormProps) {
  const { push } = useToast();
  const [state, action, pending] = useActionState(updateProfileAction, initialState);

  useEffect(() => {
    if (state.success) push({ title: "اطلاعات ذخیره شد", tone: "success" });
  }, [state.success, push]);

  return (
    <form action={action} className="grid gap-4 md:grid-cols-2">
      <div>
        <label htmlFor="profile-name">نام و نام خانوادگی</label>
        <Input id="profile-name" name="name" defaultValue={name} required />
      </div>
      <div>
        <label htmlFor="profile-phone">شماره موبایل</label>
        <Input id="profile-phone" defaultValue={phone} dir="ltr" disabled />
      </div>
      <div className="md:col-span-2">
        <label htmlFor="profile-email">ایمیل</label>
        <Input id="profile-email" name="email" type="email" defaultValue={email} dir="ltr" />
      </div>
      {state.error && (
        <p className="form-error md:col-span-2" role="alert">
          {state.error}
        </p>
      )}
      <Button type="submit" disabled={pending}>
        {pending ? "در حال ذخیره..." : "ذخیره تغییرات"}
      </Button>
    </form>
  );
}

export function ProfileForm(props: ProfileFormProps) {
  return (
    <ToastProvider>
      <ProfileFormContent {...props} />
    </ToastProvider>
  );
}
