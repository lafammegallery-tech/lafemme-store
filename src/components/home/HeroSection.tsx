import Image from "next/image";
import Link from "next/link";
import { ButtonLink, Container } from "@/components/ui";

/** Home hero section rebuilt as typed JSX while preserving the original structure and classes. */
export function HeroSection() {
  return (
    <section className="hero" aria-labelledby="home-hero-title">
      <div className="hero-ambient hero-ambient--one" aria-hidden="true" />
      <div className="hero-ambient hero-ambient--two" aria-hidden="true" />

      <Container>
        <div className="hero-wrapper">
          {/* ================= HERO TEXT ================= */}
          <div className="hero-content">
            <span className="hero-badge">
              <span aria-hidden="true">✦</span>
              مجموعه اختصاصی شمش‌های لوکس
            </span>

            <h1 id="home-hero-title">
              شمش‌های طلا و نقره لفم
              <span lang="fr">La Femme</span>
            </h1>

            <p className="hero-lead">تجسم هنر، سرمایه‌گذاری و اصالت</p>

            <p className="hero-description">
              در فروشگاه لفم (La Femme)، مجموعه شمش‌های طلا و نقره را ببینید و
              مشخصات، وزن و قیمت محصولات را برای انتخاب و خرید مقایسه کنید.
            </p>

            {/* ================= BUTTONS ================= */}
            <div className="hero-buttons">
              <ButtonLink href="/products">اکنون خرید کنید</ButtonLink>

              <Link className="hero-consultation" href="#investment-calculator">
                <span className="hero-consultation__icon" aria-hidden="true">
                  ✦
                </span>

                <span>
                  <strong>مشاوره خرید</strong>
                  <small>راهنمای انتخاب و خرید</small>
                </span>
              </Link>
            </div>

            <ul className="hero-trust" aria-label="مزیت‌های خرید از لفم (La Femme)">
              <li>
                <span aria-hidden="true">✓</span>
                تضمین اصالت
              </li>

              <li>
                <span aria-hidden="true">✓</span>
                ارسال امن
              </li>

              <li>
                <span aria-hidden="true">✓</span>
                بسته‌بندی نفیس
              </li>
            </ul>
          </div>

          {/* ================= HERO IMAGE ================= */}
          <div className="hero-image">
            <div className="hero-product-stage">
              <div className="hero-product-glow" aria-hidden="true" />

              <div className="hero-product-frame">
                <span className="hero-product-frame__shine" aria-hidden="true" />

                <div className="relative flex h-full w-full items-center justify-center">
                  <Image
                    alt="شمش طلای لفم (La Femme) در بسته‌بندی سبز"
                    src="/assets/images/hero-gold-bar.webp"
                    width={693}
                    height={965}
                    priority
                    sizes="(max-width: 768px) 62vw, 360px"
                    className="mx-auto block h-auto max-h-full w-auto max-w-full object-contain object-center"
                  />
                </div>
              </div>

              <div className="hero-product-stand" aria-hidden="true">
                <span />
              </div>

              <div
                className="hero-metal-card hero-metal-card--gold"
                data-purity="995"
                aria-hidden="true"
              >
                Au
              </div>

              <div
                className="hero-metal-card hero-metal-card--silver"
                data-purity="999"
                aria-hidden="true"
              >
                Ag
              </div>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
