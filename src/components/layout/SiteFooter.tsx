import Link from "next/link";
import { Container } from "@/components/ui";

export function SiteFooter() {
  return (
    <footer className="footer">
      <Container>
        <div className="footer-grid">

          <div className="footer-column">
            <h3>La Femme Gold</h3>
            <p>طلا و جواهر اصیل با قیمت لحظه‌ای بازار — مناسب پوشش، هدیه و سرمایه‌گذاری.</p>
            <div style={{ marginTop: "1rem", display: "flex", flexDirection: "column", gap: "0.4rem", fontSize: "0.875rem", color: "var(--color-gray)" }}>
              <span>📍 تهران، بازار بزرگ، پاساژ اردیبهشت، پلاک ۲/۳۱</span>
              <a href="tel:02155622804" style={{ color: "var(--color-gold)", textDecoration: "none" }} dir="ltr">
                📞 ۰۲۱–۵۵۶۲۲۸۰۴
              </a>
              <a
                href="https://instagram.com/lafemmegold"
                target="_blank"
                rel="noopener noreferrer"
                style={{ color: "var(--color-gold)", textDecoration: "none" }}
              >
                📸 @lafemmegold
              </a>
            </div>
          </div>

          <div className="footer-column">
            <h4>فروشگاه</h4>
            <ul>
              <li><Link href="/products">محصولات</Link></li>
              <li><Link href="/search">جست‌وجو</Link></li>
              <li><Link href="/faq">سؤالات متداول</Link></li>
            </ul>
          </div>

          <div className="footer-column">
            <h4>راهنما</h4>
            <ul>
              <li><Link href="/about">درباره ما</Link></li>
              <li><Link href="/contact">تماس با ما</Link></li>
              <li><Link href="/privacy">حریم خصوصی</Link></li>
              <li><Link href="/terms">قوانین</Link></li>
            </ul>
          </div>

          <div className="footer-column">
            <h4>حساب کاربری</h4>
            <ul>
              <li><Link href="/login">ورود</Link></li>
              <li><Link href="/dashboard">داشبورد</Link></li>
              <li><Link href="/orders">سفارش‌ها</Link></li>
            </ul>
          </div>

        </div>
        <div className="copyright">© ۱۴۰۵ La Femme Gold. تمامی حقوق محفوظ است.</div>
      </Container>
    </footer>
  );
}
