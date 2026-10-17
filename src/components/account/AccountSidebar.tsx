import Link from "next/link";
import { Icon } from "@/components/ui/Icon";

const items = [
  ["/dashboard", "داشبورد", "home"],
  ["/orders", "سفارش‌ها", "package"],
  ["/wishlist", "علاقه‌مندی‌ها", "heart"],
  ["/addresses", "آدرس‌ها", "map-pin"],
  ["/profile", "پروفایل", "user"],
] as const;

/** منوی مشترک حساب کاربری برای جلوگیری از تکرار در صفحات پنل. */
export function AccountSidebar() {
  return (
    <aside className="dashboard-sidebar" aria-label="منوی حساب کاربری">
      <h2>پنل کاربری</h2>
      <ul>
        {items.map(([href, label, icon]) => (
          <li key={href}>
            <Link href={href}>
              <Icon name={icon} size={18} />
              <span>{label}</span>
            </Link>
          </li>
        ))}
      </ul>
    </aside>
  );
}
