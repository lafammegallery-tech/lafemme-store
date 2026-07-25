"use client";
import { useActionState } from "react";
import { Button, Checkbox, Input } from "@/components/ui";
import { loginAction, registerAction, type AuthState } from "@/app/actions/auth";
const initialState: AuthState = {};
export function LoginForm({ nextPath = "" }: { nextPath?: string }) {
  const [state, action, pending] = useActionState(loginAction, initialState);
  return <form action={action} className="space-y-4">
    <input type="hidden" name="next" value={nextPath} />
    <div className="form-group"><label htmlFor="login-phone">شماره موبایل</label><Input name="phone" id="login-phone" type="tel" inputMode="numeric" placeholder="09xxxxxxxxx" autoComplete="tel" required /></div>
    <div className="form-group"><label htmlFor="login-password">رمز عبور</label><Input name="password" id="login-password" type="password" autoComplete="current-password" required /></div>
    <Checkbox label="مرا به خاطر بسپار" />
    {state.error && <p className="form-error" role="alert">{state.error}</p>}
    <Button className="btn btn-primary w-full" type="submit" disabled={pending}>{pending ? "در حال ورود..." : "ورود"}</Button>
  </form>;
}
export function RegisterForm() {
  const [state, action, pending] = useActionState(registerAction, initialState);
  return <form action={action} className="space-y-4">
    <div className="form-group"><label htmlFor="register-name">نام و نام خانوادگی</label><Input name="name" id="register-name" autoComplete="name" required /></div>
    <div className="form-group"><label htmlFor="register-phone">شماره موبایل</label><Input name="phone" id="register-phone" type="tel" inputMode="numeric" required /></div>
    <div className="form-group"><label htmlFor="register-password">رمز عبور</label><Input name="password" id="register-password" type="password" autoComplete="new-password" minLength={8} required /></div>
    <Checkbox name="terms" required label="قوانین و حریم خصوصی را می‌پذیرم" />
    {state.error && <p className="form-error" role="alert">{state.error}</p>}
    <Button className="btn btn-primary w-full" type="submit" disabled={pending}>{pending ? "در حال ثبت‌نام..." : "ثبت‌نام"}</Button>
  </form>;
}
export function ForgotPasswordForm() { return <form className="space-y-4"><div className="form-group"><label htmlFor="forgot-phone">شماره موبایل</label><Input id="forgot-phone" type="tel" inputMode="numeric" placeholder="09xxxxxxxxx" /></div><p className="text-sm">بازیابی پیامکی پس از اتصال سرویس پیامک فعال می‌شود.</p><Button type="button" disabled className="btn btn-primary w-full">ارسال کد بازیابی</Button></form>; }
