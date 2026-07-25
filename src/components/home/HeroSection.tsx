import Image from "next/image";
import { ButtonLink, Container } from "@/components/ui";

/** Home hero section rebuilt as typed JSX while preserving the original structure and classes. */
export function HeroSection() {
  return (
    <section className="hero" aria-labelledby="home-hero-title">
      <Container>
        <div className="hero-wrapper">
          {/* ================= HERO TEXT ================= */}
          <div className="hero-content">
            <span className="hero-badge">✦ مجموعه اختصاصی شمش‌های لوکس</span>
            <h1 id="home-hero-title">
              شمش‌های طلا و نقره <span>La Femme</span>
            </h1>
            <p>
              مجموعه‌ای منتخب از شمش‌های طلا و نقره با طراحی لوکس، کیفیت ممتاز و مناسب برای
              سرمایه‌گذاری، هدیه و حفظ ارزش دارایی.
            </p>

            {/* ================= BUTTONS ================= */}
            <div className="hero-buttons">
              <ButtonLink href="/products">مشاهده محصولات</ButtonLink>
              <ButtonLink href="/about" className="btn btn-secondary">
                درباره برند
              </ButtonLink>
            </div>
          </div>

          {/* ================= HERO IMAGE ================= */}
          <div className="hero-image">
            {/*
             * فعلاً این تصویر قرار می‌گیرد.
             * بعداً آن را با رندر سه‌بعدی اختصاصی شمش La Femme جایگزین می‌کنیم.
             */}
            <Image
              alt="شمش طلای La Femme"
              src="/assets/images/hero-gold-bar.png"
              width={844}
              height={845}
              priority
              sizes="(max-width: 768px) 100vw, 50vw"
            />
          </div>
        </div>
      </Container>
    </section>
  );
}
