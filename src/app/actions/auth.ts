"use server";
import { redirect } from "next/navigation";
import { userRepository } from "@/backend/database/repositories/user.repository";
import { createSession, destroySession } from "@/backend/auth/session";
import { hashPassword, verifyPassword } from "@/backend/auth/password";

export type AuthState = { error?: string };

const normalizePhone = (value: FormDataEntryValue | null) =>
  String(value ?? "").replace(/\D/g, "");

/** این تابع کاربر جدید را در سیستم ثبت می‌کند. */
export async function registerAction(_: AuthState, formData: FormData): Promise<AuthState> {
  const fullName = String(formData.get("name") ?? "").trim();
  const phone = normalizePhone(formData.get("phone"));
  const password = String(formData.get("password") ?? "");

  if (!/^09\d{9}$/.test(phone)) return { error: "شماره موبایل معتبر وارد کنید." };
  if (password.length < 8) return { error: "رمز عبور باید حداقل ۸ کاراکتر باشد." };
  if (!fullName) return { error: "نام و نام خانوادگی را وارد کنید." };
  if (await userRepository.findByPhone(phone)) return { error: "این شماره موبایل قبلاً ثبت شده است." };

  const [firstName, ...rest] = fullName.split(/\s+/);
  const passwordHash = await hashPassword(password);
  const user = await userRepository.create({
    phone,
    firstName,
    lastName: rest.join(" ") || undefined,
    passwordHash,
  });

  await createSession(user.id, user.role);
  redirect("/dashboard");
}

/** این تابع ورود کاربر به سیستم را مدیریت می‌کند. */
export async function loginAction(_: AuthState, formData: FormData): Promise<AuthState> {
  const phone = normalizePhone(formData.get("phone"));
  const password = String(formData.get("password") ?? "");

  const user = await userRepository.findByPhone(phone);
  if (!user?.passwordHash || !user.isActive) return { error: "شماره موبایل یا رمز عبور نادرست است." };

  const valid = await verifyPassword(password, user.passwordHash);
  if (!valid) return { error: "شماره موبایل یا رمز عبور نادرست است." };

  await createSession(user.id, user.role);
  redirect("/dashboard");
}

/** این تابع کاربر را از سیستم خارج می‌کند. */
export async function logoutAction() {
  await destroySession();
  redirect("/");
}
