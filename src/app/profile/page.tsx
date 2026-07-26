import type { Metadata } from "next";
import { requireSession } from "@/backend/auth/session";
import { AccountLayout } from "@/components/account/AccountLayout";
import { ProfileForm } from "@/components/account/ProfileForm";
import { PageLayout } from "@/components/common";
import { Card } from "@/components/ui";

export const metadata: Metadata = {
  title: "پروفایل | La Femme",
  robots: { index: false, follow: false },
};

/** صفحه ویرایش پروفایل — فقط برای کاربران لاگین‌شده. */
export default async function ProfilePage() {
  // این بخش سطح دسترسی کاربر را بررسی می‌کند
  await requireSession();

  return (
    <PageLayout>
      <AccountLayout>
        <Card className="dashboard-card p-6">
          <h1>پروفایل من</h1>
          <ProfileForm />
        </Card>
      </AccountLayout>
    </PageLayout>
  );
}
