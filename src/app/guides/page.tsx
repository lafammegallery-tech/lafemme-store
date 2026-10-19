import type { Metadata } from "next";
import Link from "next/link";
import { PageHero, PageLayout } from "@/components/common";
import { Container } from "@/components/ui";
import { BuyingGuideCards } from "@/components/content/BuyingGuideCards";
import { StructuredData } from "@/components/seo/StructuredData";
import { breadcrumbSchema } from "@/lib/seo";

export const metadata: Metadata = {
  title: "راهنمای خرید شمش طلا و نقره",
  description: "راهنمای انتخاب شمش طلا و نقرهٔ لفم برای پس‌انداز و هدیه؛ با بسته‌بندی ضدجعل، شماره‌سریال مخفی و زیبایی چشم‌نواز.",
  alternates: { canonical: "/guides" },
};

export default function GuidesPage() {
  return (
    <PageLayout>
      <StructuredData data={breadcrumbSchema([{ name: "خانه", path: "/" }, { name: "راهنمای خرید", path: "/guides" }])} />
      <PageHero title="راهنمای خرید لفم" description="از اولین شمش تا مجموعه‌ای ارزشمند؛ همراه شما در انتخاب طلا و نقره." />
      <section className="buying-guides-section"><Container>
        <BuyingGuideCards />
        <aside className="buying-guide-panel buying-guide-spaced"><h2>انتخابی زیبا برای امروز، برنامه‌ای برای فردا</h2><p>با شمش‌های لفم، ارزش فلزات گران‌بها را با کیفیت، زیبایی، بسته‌بندی ضدجعل و شماره‌سریال مخفی همراه کنید. مدل دلخواهتان را برای پس‌انداز، تکمیل مجموعه یا هدیه انتخاب کنید و خریدتان را با بودجهٔ خود هماهنگ بسازید.</p><div className="buying-guide-actions"><Link className="buying-guide-link" href="/products">انتخاب شمش و خرید ←</Link><Link className="buying-guide-link" href="/#investment-calculator">انتخاب بر اساس بودجه ←</Link><Link className="buying-guide-link" href="/contact">همراهی در خرید ←</Link></div></aside>
      </Container></section>
    </PageLayout>
  );
}
