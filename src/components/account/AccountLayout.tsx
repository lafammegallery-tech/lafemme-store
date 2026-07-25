import type { ReactNode } from "react";
import { Container } from "@/components/ui";
import { AccountSidebar } from "./AccountSidebar";

/** چیدمان مشترک صفحات حساب کاربری با Sidebar ثابت و محتوای قابل جایگزینی. */
export function AccountLayout({ children }: { children: ReactNode }) {
  return (
    <section className="dashboard">
      <Container>
        <div className="dashboard-layout">
          <AccountSidebar />
          <div className="dashboard-content">{children}</div>
        </div>
      </Container>
    </section>
  );
}
