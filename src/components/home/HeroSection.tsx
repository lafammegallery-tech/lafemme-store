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
              شمش‌های طلا و نقره
              <span lang="fr">La Femme</span>
            </h1>
            <p className="hero-lead">تجسم هنر، سرمایه‌گذاری و اصالت</p>
            <p className="hero-description">
              مجموعه‌ای منتخب از شمش‌های طلا و نقره با طراحی ماندگار، بسته‌بندی نفیس و تضمین اصالت؛
              برای هدیه‌ای ارزشمند و سرمایه‌گذاری مطمئن.
            </p>

            {/* ================= BUTTONS ================= */}
            <div className="hero-buttons">
              <ButtonLink href="/products">اکنون خرید کنید</ButtonLink>
              <Link className="hero-consultation" href="/contact">
                <span className="hero-consultation__icon" aria-hidden="true">
                  ✦
                </span>
                <span>
                  <strong>مشاوره رایگان</strong>
                  <small>راهنمای انتخاب و خرید</small>
                </span>
              </Link>
            </div>

            <ul className="hero-trust" aria-label="مزیت‌های خرید از La Femme">
              <li>
                <span aria-hidden="true">✓</span> تضمین اصالت
              </li>
              <li>
                <span aria-hidden="true">✓</span> ارسال امن
              </li>
              <li>
                <span aria-hidden="true">✓</span> بسته‌بندی نفیس
              </li>
            </ul>
          </div>

          {/* ================= HERO IMAGE ================= */}
          <div className="hero-image">
            <div className="hero-product-stage">
              <div className="hero-product-glow" aria-hidden="true" />
              <div className="hero-product-frame">
                <span className="hero-product-frame__shine" aria-hidden="true" />
                <Image
                  alt="شمش طلای La Femme در بسته‌بندی سبز"
                  src="/assets/images/hero-gold-bar.png"
                  width={693}
                  height={965}
                  priority
                  sizes="(max-width: 768px) 62vw, 360px"
                />
              </div>
              <div className="hero-product-stand" aria-hidden="true">
                <span />
              </div>
              <div className="hero-metal-card hero-metal-card--gold" aria-hidden="true">
                Au
              </div>
              <div className="hero-metal-card hero-metal-card--silver" aria-hidden="true">
                Ag
              </div>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
