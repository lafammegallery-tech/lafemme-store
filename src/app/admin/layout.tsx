import type { ReactNode } from "react";
import { requireAdmin } from "@/backend/auth/session";
import { AdminNav } from "@/components/admin/AdminNav";

export const dynamic = "force-dynamic";

export default async function AdminLayout({ children }: { children: ReactNode }) {
  await requireAdmin();
  return (
    <div className="admin-shell">
      <AdminNav />
      {children}
    </div>
  );
}
