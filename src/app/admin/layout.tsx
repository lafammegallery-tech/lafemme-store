import type { ReactNode } from "react";
import type { Metadata } from "next";
import { requireAdmin } from "@/backend/auth/session";
import { AdminNav } from "@/components/admin/AdminNav";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { robots: { index: false, follow: false } };

export default async function AdminLayout({ children }: { children: ReactNode }) {
  await requireAdmin();
  return (
    <div className="admin-shell">
      <AdminNav />
      {children}
    </div>
  );
}
