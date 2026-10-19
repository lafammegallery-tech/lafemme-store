import Link from "next/link";
import { Container } from "@/components/ui";
import { BuyingGuideCards } from "@/components/content/BuyingGuideCards";

export function BuyingGuidesSection() {
  return (
    <section className="buying-guides-section" aria-labelledby="buying-guides-title">
      <Container>
        <div className="buying-guide-section-heading">
          <div><span className="buying-guide-eyebrow">درخشش یک انتخاب ارزشمند</span><h2 id="buying-guides-title">با لفم، مجموعهٔ ارزشمند خود را بسازید</h2><p>راهنمای انتخاب شمش طلا و نقره؛ برای پس‌انداز، سرمایه‌گذاری بلندمدت و هدیه‌ای ماندگار.</p></div>
          <Link className="buying-guide-link" href="/guides">همهٔ راهنماها <span aria-hidden="true">←</span></Link>
        </div>
        <BuyingGuideCards />
      </Container>
    </section>
  );
}
