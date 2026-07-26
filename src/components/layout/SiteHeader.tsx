import Image from "next/image";
import Link from "next/link";
import { Container } from "@/components/ui";
import { MobileNavigation } from "./MobileNavigation";
import { MarketTicker } from "@/components/market/MarketTicker";
import { ThemeToggle } from "@/components/theme/ThemeToggle";

const navigationItems = [
  { href: "/", label: "خانه" },
  { href: "/products", label: "محصولات" },
  { href: "/about", label: "درباره ما" },
  { href: "/contact", label: "تماس با ما" },
] as const;

/**
 * Shared site header preserving the exact legacy class names and DOM hierarchy.
 * The market values remain static until the approved data/API phase.
 */
export function SiteHeader() {
  return (
    <header className="header">
      {/*
       * Container باعث می‌شود محتوا همیشه
       * وسط صفحه بماند و به لبه‌های مانیتور نچسبد.
       */}
      <Container>
        {/*
         * این بخش سه قسمت Header را کنار هم قرار می‌دهد:
         * 1- لوگو
         * 2- منو
         * 3- دکمه تماس
         */}
        <div className="header-content">
          {/* ================= Logo ================= */}
          <Link className="logo" href="/" aria-label="صفحه اصلی La Femme">
            <Image
              alt="La Femme Logo"
              src="/assets/images/logo.png"
              width={180}
              height={180}
              priority
            />
          </Link>
          {/* پایان لوگو */}

          {/* ================= Navigation ================= */}
          <nav className="main-nav" aria-label="منوی اصلی">
            <ul>
              {navigationItems.map((item) => (
                <li key={item.href}>
                  <Link href={item.href}>{item.label}</Link>
                </li>
              ))}
            </ul>
          </nav>
          {/* پایان منو */}

          {/* ================= CTA Button ================= */}
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <Link className="contact-button" href="/contact">
              ارتباط با ما
            </Link>
            <Link className="hidden text-sm text-lf-gray-light lg:inline" href="/login">
              حساب کاربری
            </Link>
            <MobileNavigation />
          </div>
        </div>
      </Container>

      {/*
       * LIVE MARKET BAR
       * در نسخه نهایی اطلاعات از API دریافت می‌شود.
       * فعلاً مقادیر نمونه اصلی حفظ شده‌اند.
       */}
      <div className="market-bar" aria-label="قیمت لحظه‌ای بازار">
        <Container>
          <MarketTicker />
        </Container>
      </div>
    </header>
  );
}
