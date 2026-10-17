"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Icon } from "@/components/ui/Icon";

const LINKS = [
  { href: "/admin/messages", label: "پیام‌های تماس", icon: "mail" },
  { href: "/admin", label: "داشبورد", icon: "chart" },
  { href: "/admin/products", label: "محصولات", icon: "package" },
  { href: "/admin/categories", label: "دسته‌بندی", icon: "grid" },
  { href: "/admin/orders", label: "سفارش‌ها", icon: "receipt" },
  { href: "/admin/payment-receipts", label: "رسیدها", icon: "receipt" },
  { href: "/admin/payment-methods", label: "روش پرداخت", icon: "card" },
  { href: "/admin/shipping-methods", label: "روش ارسال", icon: "truck" },
  { href: "/admin/inventory", label: "موجودی", icon: "package" },
  { href: "/admin/coupons", label: "تخفیف‌ها", icon: "tag" },
  { href: "/admin/market-prices", label: "قیمت بازار", icon: "chart" },
  { href: "/admin/users", label: "کاربران", icon: "user" },
] as const;

export function AdminNav() {
  const pathname = usePathname();
  return (
    <nav className="admin-nav" aria-label="پیمایش مدیریت">
      <div className="admin-nav-inner">
        <span className="admin-nav-brand">La Femme • مدیریت</span>
        <div className="admin-nav-links">
          {LINKS.map((l) => {
            const active =
              l.href === "/admin" ? pathname === "/admin" : pathname.startsWith(l.href);
            return (
              <Link
                key={l.href}
                href={l.href}
                className={`admin-nav-link${active ? " active" : ""}`}
              >
                <Icon name={l.icon} size={18} />
                {l.label}
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
