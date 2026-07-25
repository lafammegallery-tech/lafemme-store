"use server";
import { redirect } from "next/navigation";
import { userRepository } from "@/backend/database/repositories/user.repository";
import { createSession, destroySession } from "@/backend/auth/session";
import { hashPassword, verifyPassword } from "@/backend/auth/password";

export type AuthState = { error?: string };
const normalizePhone = (value: FormDataEntryValue | null) => String(value ?? "").replace(/\D/g, "");
export async function registerAction(_: AuthState, formData: FormData): Promise<AuthState> {
  const fullName = String(formData.get("name") ?? "").trim(); const phone = normalizePhone(formData.get("phone")); const password = String(formData.get("password") ?? "");
  if (!/^09\d{9}$/.test(phone)) return { error: "شماره موبایل معتبر وارد کنید." };
  if (password.length < 8) return { error: "رمز عبور باید حداقل ۸ کاراکتر باشد." };
  if (!fullName) return { error: "نام و نام خانوادگی را وارد کنید." };
  if (await userRepository.findByPhone(phone)) return { error: "این شماره موبایل قبلاً ثبت شده است." };
  const [firstName, ...rest] = fullName.split(/\s+/);
  const user = await userRepository.create({ phone, firstName, lastName: rest.join(" ") || undefined, passwordHash: hashPassword(password) });
  await createSession(user.id, user.role); redirect("/dashboard");
}
export async function loginAction(_: AuthState, formData: FormData): Promise<AuthState> {
  const phone = normalizePhone(formData.get("phone"));
  const password = String(formData.get("password") ?? "");
  const requestedNext = String(formData.get("next") ?? "");
  const safeNext = requestedNext.startsWith("/") && !requestedNext.startsWith("//")
    ? requestedNext
    : null;

  const user = await userRepository.findByPhone(phone);
  if (!user?.passwordHash || !user.isActive || !verifyPassword(password, user.passwordHash)) {
    return { error: "شماره موبایل یا رمز عبور نادرست است." };
  }

  await createSession(user.id, user.role);
  redirect(safeNext ?? (user.role === "ADMIN" || user.role === "STAFF" ? "/admin" : "/dashboard"));
}
export async function logoutAction() { await destroySession(); redirect("/"); }
