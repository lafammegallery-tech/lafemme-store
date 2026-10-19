import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PageHero, PageLayout } from "@/components/common";
import { Container } from "@/components/ui";
import { StructuredData } from "@/components/seo/StructuredData";
import { breadcrumbSchema } from "@/lib/seo";
import { buyingGuides, getBuyingGuide } from "@/data/buying-guides";

interface PageProps { params: Promise<{ slug: string }> }

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const guide = getBuyingGuide((await params).slug);
  if (!guide) notFound();
  return { title: guide.title, description: guide.summary, alternates: { canonical: `/guides/${guide.slug}` }, openGraph: { title: guide.title, description: guide.summary, url: `/guides/${guide.slug}`, type: "article" } };
}

export default async function GuidePage({ params }: PageProps) {
  const guide = getBuyingGuide((await params).slug);
  if (!guide) notFound();
  return (
    <PageLayout>
      <StructuredData data={breadcrumbSchema([{ name: "خانه", path: "/" }, { name: "راهنمای خرید", path: "/guides" }, { name: guide.title, path: `/guides/${guide.slug}` }])} />
      <PageHero title={guide.title} description={guide.summary} />
      <section className="buying-guides-section"><Container>
        <div className="buying-guide-reading-layout">
          <nav className="buying-guide-toc" aria-label="فهرست راهنما"><h2>در این راهنما</h2><ol>{guide.sections.map((section, index) => <li key={section.title}><a href={`#section-${index + 1}`}>{section.title}</a></li>)}</ol><Link className="buying-guide-link" href="/guides">همهٔ راهنماها ←</Link></nav>
          <article className="buying-guide-panel buying-guide-article">
            <p className="buying-guide-eyebrow">همراه انتخاب شما؛ راهنمای خرید شمش از لفم</p>
            {guide.sections.map((section, index) => <section id={`section-${index + 1}`} key={section.title}><h2>{section.title}</h2>{section.paragraphs.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}{section.checklist && <ul className="buying-guide-checklist">{section.checklist.map((item) => <li key={item}>{item}</li>)}</ul>}</section>)}
            <aside className="buying-guide-callout"><h2>درخشش بعدی مجموعهٔ شما کدام است؟</h2><p>شمش‌های طلا و نقرهٔ لفم را ببینید، وزن دلخواهتان را انتخاب کنید و قدم بعدی برنامهٔ پس‌انداز یا هدیهٔ خود را بردارید. پشتیبانی لفم هم برای همراهی در انتخاب در کنار شماست.</p><div className="buying-guide-actions"><Link className="buying-guide-link" href="/products">انتخاب شمش و خرید ←</Link><Link className="buying-guide-link" href="/#investment-calculator">انتخاب بر اساس بودجه ←</Link><Link className="buying-guide-link" href="/contact">همراهی پشتیبانی ←</Link></div></aside>
          </article>
        </div>
        <div className="buying-guide-panel buying-guide-spaced"><h2>مطالعهٔ بیشتر</h2><ul>{buyingGuides.filter((item) => item.slug !== guide.slug).map((item) => <li key={item.slug}><Link className="buying-guide-link" href={`/guides/${item.slug}`}>{item.title} ←</Link></li>)}</ul></div>
      </Container></section>
    </PageLayout>
  );
}
