"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

const LINKS = [
  { href: "/admin", label: "داشبورد", icon: "📊" },
  { href: "/admin/products", label: "محصولات", icon: "💍" },
  { href: "/admin/categories", label: "دسته‌بندی", icon: "🗂" },
  { href: "/admin/orders", label: "سفارش‌ها", icon: "🧾" },
  { href: "/admin/payment-receipts", label: "رسیدها", icon: "🧿" },
  { href: "/admin/payment-methods", label: "روش پرداخت", icon: "💳" },
  { href: "/admin/shipping-methods", label: "روش ارسال", icon: "🚚" },
  { href: "/admin/inventory", label: "موجودی", icon: "📦" },
  { href: "/admin/coupons", label: "تخفیف‌ها", icon: "🏷" },
  { href: "/admin/market-prices", label: "قیمت بازار", icon: "📈" },
  { href: "/admin/users", label: "کاربران", icon: "👤" },
];

export function AdminNav() {
  const pathname = usePathname();
  return (
    <nav className="admin-nav" aria-label="پیمایش مدیریت">
      <div className="admin-nav-inner">
        <span className="admin-nav-brand">La Femme • مدیریت</span>
        <div className="admin-nav-links">
          {LINKS.map((l) => {
            const active = l.href === "/admin" ? pathname === "/admin" : pathname.startsWith(l.href);
            return (
              <Link key={l.href} href={l.href} className={`admin-nav-link${active ? " active" : ""}`}>
                <span aria-hidden>{l.icon}</span>
                {l.label}
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
