import Link from "next/link";

const items = [
  ["/dashboard", "🏠 داشبورد"],
  ["/orders", "📦 سفارش‌ها"],
  ["/wishlist", "❤️ علاقه‌مندی‌ها"],
  ["/addresses", "📍 آدرس‌ها"],
  ["/profile", "⚙ پروفایل"],
] as const;

/** منوی مشترک حساب کاربری برای جلوگیری از تکرار در صفحات پنل. */
export function AccountSidebar() {
  return (
    <aside className="dashboard-sidebar" aria-label="منوی حساب کاربری">
      <h2>پنل کاربری</h2>
      <ul>
        {items.map(([href, label]) => (
          <li key={href}>
            <Link href={href}>{label}</Link>
          </li>
        ))}
      </ul>
    </aside>
  );
}
