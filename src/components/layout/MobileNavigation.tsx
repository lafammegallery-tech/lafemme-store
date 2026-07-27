"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { Drawer, IconButton } from "@/components/ui";

const baseItems = [
  ["/", "خانه"],
  ["/products", "محصولات"],
  ["/search", "جست‌وجو"],
  ["/about", "درباره ما"],
  ["/contact", "تماس با ما"],
] as const;

function readRoleCookie(): "ADMIN" | "STAFF" | "CUSTOMER" | null {
  const match = document.cookie.match(/(?:^|;\s*)lf_role=([^;]*)/);
  const value = match ? decodeURIComponent(match[1]) : "";
  return value === "ADMIN" || value === "STAFF" || value === "CUSTOMER" ? value : null;
}

/** منوی موبایل قابل دسترس؛ با Drawer سیستم طراحی باز می‌شود. */
export function MobileNavigation() {
  const [open, setOpen] = useState(false);
  const [role, setRole] = useState<"ADMIN" | "STAFF" | "CUSTOMER" | null>(null);

  useEffect(() => {
    setRole(readRoleCookie());
  }, []);

  const isAdmin = role === "ADMIN" || role === "STAFF";
  const loggedIn = role !== null;
  const items: readonly (readonly [string, string])[] = [
    ...baseItems,
    ...(isAdmin ? ([["/admin", "پنل مدیریت"]] as const) : []),
    loggedIn ? (["/dashboard", "پنل کاربری"] as const) : (["/login", "ورود"] as const),
  ];

  return (
    <>
      <IconButton
        className="menu-toggle"
        label="باز کردن منو"
        icon={<span aria-hidden="true">☰</span>}
        onClick={() => setOpen(true)}
      />
      <Drawer open={open} onClose={() => setOpen(false)} title="منوی اصلی">
        <nav aria-label="منوی موبایل">
          <ul className="space-y-3">
            {items.map(([href, label]) => (
              <li key={href}>
                <Link
                  className="block rounded-lg px-3 py-3 hover:bg-lf-gold/10"
                  href={href}
                  onClick={() => setOpen(false)}
                >
                  {label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </Drawer>
    </>
  );
}
