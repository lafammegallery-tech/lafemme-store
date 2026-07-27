"use server";
import { revalidatePath } from "next/cache";
import { requireSession } from "@/backend/auth/session";
import { userRepository } from "@/backend/database/repositories/user.repository";
import { text } from "@/backend/security/validation";

export type ProfileState = { error?: string; success?: boolean };

/** این تابع اطلاعات پروفایل کاربر واقعی (نام و ایمیل) را به‌روزرسانی می‌کند. */
export async function updateProfileAction(
  _: ProfileState,
  formData: FormData,
): Promise<ProfileState> {
  const session = await requireSession("/profile");

  const fullName = text(formData.get("name"), 120);
  const email = text(formData.get("email"), 200);

  if (!fullName) return { error: "نام و نام خانوادگی را وارد کنید." };
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { error: "ایمیل معتبر وارد کنید." };
  }
  if (email) {
    const existing = await userRepository.findByEmail(email);
    if (existing && existing.id !== session.userId) {
      return { error: "این ایمیل قبلاً برای حساب دیگری ثبت شده است." };
    }
  }

  const [firstName, ...rest] = fullName.split(/\s+/);
  await userRepository.updateProfile(session.userId, {
    firstName,
    lastName: rest.join(" ") || undefined,
    email: email || undefined,
  });

  revalidatePath("/profile");
  return { success: true };
}
