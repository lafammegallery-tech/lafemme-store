import Link from "next/link";
import { Container } from "@/components/ui";

/** Footer مشترک با لینک‌های کامل‌تر، بدون تغییر هویت بصری اصلی. */
export function SiteFooter() {
  return (
    <footer className="footer">
      <Container>
        <div className="footer-grid">
          <div className="footer-column">
            <h3>La Femme</h3>
            <p>شمش‌های طلا و نقره با کیفیت ممتاز، مناسب سرمایه‌گذاری و هدیه.</p>
          </div>
          <div className="footer-column">
            <h4>فروشگاه</h4>
            <ul>
              <li>
                <Link href="/products">محصولات</Link>
              </li>
              <li>
                <Link href="/search">جست‌وجو</Link>
              </li>
              <li>
                <Link href="/faq">سؤالات متداول</Link>
              </li>
            </ul>
          </div>
          <div className="footer-column">
            <h4>راهنما</h4>
            <ul>
              <li>
                <Link href="/about">درباره ما</Link>
              </li>
              <li>
                <Link href="/contact">تماس با ما</Link>
              </li>
              <li>
                <Link href="/privacy">حریم خصوصی</Link>
              </li>
              <li>
                <Link href="/terms">قوانین</Link>
              </li>
            </ul>
          </div>
          <div className="footer-column">
            <h4>حساب کاربری</h4>
            <ul>
              <li>
                <Link href="/login">ورود</Link>
              </li>
              <li>
                <Link href="/dashboard">داشبورد</Link>
              </li>
              <li>
                <Link href="/orders">سفارش‌ها</Link>
              </li>
            </ul>
          </div>
        </div>
        <div className="copyright">© 2026 La Femme. تمامی حقوق محفوظ است.</div>
      </Container>
    </footer>
  );
}
