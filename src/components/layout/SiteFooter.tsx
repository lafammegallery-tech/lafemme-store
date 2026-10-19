import Link from "next/link";
import { Container } from "@/components/ui";
import { Icon } from "@/components/ui/Icon";

export function SiteFooter() {
  return (
    <footer className="footer" dir="rtl">
      <Container>
        <div className="footer-grid">
          <div className="footer-column footer-brand">
            <h3>لفم (La Femme)</h3>
            <p>فروشگاه شمش طلا و نقره لفم؛ مشاهده و مقایسه مشخصات، وزن و قیمت محصولات.</p>
            <div className="footer-contact">
              <span className="footer-contact-row">
                <Icon name="map-pin" size={18} />
                <span>تهران، بازار بزرگ، پاساژ اردیبهشت، پلاک ۲/۳۱</span>
              </span>
              <a className="footer-contact-row" href="tel:02155622804">
                <Icon name="phone" size={18} />
                <bdi dir="ltr">۰۲۱–۵۵۶۲۲۸۰۴</bdi>
              </a>
              <a
                className="footer-contact-row"
                href="https://instagram.com/lafemmegold"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Icon name="instagram" size={18} />
                <bdi dir="ltr">@lafemmegold</bdi>
              </a>
            </div>
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
        <div className="copyright">© ۱۴۰۵ La Femme Gold. تمامی حقوق محفوظ است.</div>
      </Container>
    </footer>
  );
}
