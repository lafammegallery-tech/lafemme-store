"use client";

import { Container } from "@/components/ui";
import { formatMoney } from "@/lib/format-money";
import { useMarketData } from "./useMarketData";

interface Quote {
  metal: "GOLD" | "SILVER";
  price: number;
  stale: boolean;
}

interface MarketData {
  gold: Quote;
  silver: Quote;
}

const emptyQuote = (metal: Quote["metal"]): Quote => ({
  metal,
  price: 0,
  stale: true,
});

function formatPrice(value: number): string {
  if (value <= 0) return "در حال دریافت";
  return formatMoney(value);
}

function QuoteCard({ quote, title }: { quote: Quote; title: string }) {
  return (
    <article className={`luxury-market-card luxury-market-card--${quote.metal.toLowerCase()}`}>
      <div className="luxury-market-card__topline">
        <span className="luxury-market-card__eyebrow">قیمت لحظه‌ای بازار</span>
      </div>
      <h3>{title}</h3>
      <strong>{formatPrice(quote.price)} تومان</strong>
      {quote.stale && <p role="status">{quote.price > 0 ? "قیمت فعلاً تأیید نشده است" : "قیمت معتبر در حال دریافت است"}</p>}
    </article>
  );
}

export function MarketOverview() {
  const quotes: MarketData = useMarketData() ?? {
    gold: emptyQuote("GOLD"),
    silver: emptyQuote("SILVER"),
  };

  return (
    <section className="luxury-market-section" aria-labelledby="market-overview-title">
      <Container>
        <div className="section-title luxury-market-heading">
          <span>Live Precious Metals</span>
          <h2 id="market-overview-title">نبض بازار فلزات گران‌بها</h2>
          <p>قیمت هر گرم طلا و نقره به تومان؛ مبنایی برای مقایسه و انتخاب شما.</p>
        </div>
        <div className="luxury-market-grid">
          <QuoteCard quote={quotes.gold} title="طلای ۱۸ عیار" />
          <QuoteCard quote={quotes.silver} title="نقره خالص" />
        </div>
      </Container>
    </section>
  );
}
