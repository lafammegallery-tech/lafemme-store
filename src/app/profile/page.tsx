import type { Metadata } from "next";
import { requireSession } from "@/backend/auth/session";
import { userRepository } from "@/backend/database/repositories/user.repository";
import { AccountLayout } from "@/components/account/AccountLayout";
import { ProfileForm } from "@/components/account/ProfileForm";
import { PageLayout } from "@/components/common";
import { Card } from "@/components/ui";

export const metadata: Metadata = {
  title: "پروفایل | La Femme",
  robots: { index: false, follow: false },
};
export const dynamic = "force-dynamic";

/** صفحه ویرایش پروفایل — فقط برای کاربران لاگین‌شده. */
export default async function ProfilePage() {
  // این بخش سطح دسترسی کاربر را بررسی می‌کند
  const session = await requireSession("/profile");
  const user = await userRepository.findById(session.userId);

  return (
    <PageLayout>
      <AccountLayout>
        <Card className="dashboard-card p-6">
          <h1>پروفایل من</h1>
          <ProfileForm
            name={[user?.firstName, user?.lastName].filter(Boolean).join(" ")}
            phone={user?.phone ?? ""}
            email={user?.email ?? ""}
          />
        </Card>
      </AccountLayout>
    </PageLayout>
  );
}
