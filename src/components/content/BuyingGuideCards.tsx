import Link from "next/link";
import { buyingGuides } from "@/data/buying-guides";

export function BuyingGuideCards() {
  return (
    <div className="buying-guide-grid">
      {buyingGuides.map((guide, index) => (
        <article className="buying-guide-card" key={guide.slug}>
          <span className="buying-guide-eyebrow">راهنمای {(index + 1).toLocaleString("fa-IR")} · {guide.category}</span>
          <h3><Link href={`/guides/${guide.slug}`}>{guide.title}</Link></h3>
          <p>{guide.summary}</p>
          <Link className="buying-guide-link" href={`/guides/${guide.slug}`}>مطالعهٔ راهنما <span aria-hidden="true">←</span></Link>
        </article>
      ))}
    </div>
  );
}
