import Link from "next/link";
import { Container } from "@/components/ui";
import { getProductEditorial } from "@/lib/product-editorial";
import type { Product } from "@/types/product";

export function ProductBuyingGuide({ product }: { product: Product }) {
  const editorial = getProductEditorial(product);
  if (!editorial) return null;
  return (
    <section className="buying-guides-section" aria-labelledby="product-buying-guide-title">
      <Container>
        <article className="buying-guide-panel" data-product-editorial={product.id}>
          <span className="buying-guide-eyebrow">درخشش لفم؛ ارزش، کیفیت و زیبایی</span>
          <h2 id="product-buying-guide-title">{editorial.heading}</h2>
          <div className="buying-guide-facts" aria-label="مشخصات ثبت‌شدهٔ محصول">
            <span>وزن: {product.weightValue.toLocaleString("fa-IR")} گرم</span><span>عیار: {product.purity}</span><span>برند ثبت‌شده: <bdi>{product.brand}</bdi></span><span>فروشنده: لفم</span>
          </div>
          {editorial.paragraphs.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
          <h3>بسته‌بندی ضدجعل و شماره‌سریال مخفی؛ امضای شمش‌های لفم</h3>
          <p>شمش‌های لفم با بسته‌بندی ضدجعل و شماره‌سریال مخفی عرضه می‌شوند. این ویژگی‌ها در کنار توجه به کیفیت و زیبایی چشم‌نواز شمش، تجربه‌ای متمایز از انتخاب یک فلز گران‌بها می‌سازند؛ برای مجموعهٔ شخصی شما یا هدیه‌ای که با سلیقه انتخاب شده است.</p>
          <h3>انتخاب امروز، بخشی از برنامهٔ فردای شما</h3>
          <p>وزن دلخواهتان را انتخاب کنید، قیمت همین محصول را ببینید و آن را به سبد خرید اضافه کنید. برای چیدن ترکیبی از وزن‌ها هم می‌توانید از محاسبه‌گر بودجهٔ لفم کمک بگیرید و خریدتان را با برنامهٔ شخصی خود هماهنگ کنید.</p>
          <div className="buying-guide-actions"><a className="buying-guide-link" href="#product-purchase">انتخاب این شمش و خرید ←</a><Link className="buying-guide-link" href={`/guides/${editorial.guideSlug}`}>راهنمای انتخاب شمش ←</Link><Link className="buying-guide-link" href="/guides/bullion-authenticity-checklist">آشنایی با بسته‌بندی لفم ←</Link><Link className="buying-guide-link" href="/contact">همراهی پشتیبانی در خرید ←</Link></div>
        </article>
      </Container>
    </section>
  );
}
