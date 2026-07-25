"use client";
import { useState } from "react";
import Link from "next/link";
import { Drawer, IconButton } from "@/components/ui";

const items = [
  ["/", "خانه"],
  ["/products", "محصولات"],
  ["/search", "جست‌وجو"],
  ["/about", "درباره ما"],
  ["/contact", "تماس با ما"],
  ["/login", "ورود"],
] as const;
/** منوی موبایل قابل دسترس؛ با Drawer سیستم طراحی باز می‌شود. */
export function MobileNavigation() {
  const [open, setOpen] = useState(false);
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
                  className="block rounded-lg px-3 py-3 hover:bg-white/5"
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
