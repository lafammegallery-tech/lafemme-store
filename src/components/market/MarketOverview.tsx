"use client";

import { useEffect, useState } from "react";
import { Container } from "@/components/ui";

interface Quote {
  metal: "GOLD" | "SILVER";
  price: number;
  change24h: number;
  stale: boolean;
}

interface MarketData {
  gold: Quote;
  silver: Quote;
}

const emptyQuote = (metal: Quote["metal"]): Quote => ({
  metal,
  price: 0,
  change24h: 0,
  stale: true,
});

function formatPrice(value: number): string {
  if (value <= 0) return "در حال دریافت";
  return new Intl.NumberFormat("fa-IR", { maximumFractionDigits: 2 }).format(value);
}

function QuoteCard({ quote, title }: { quote: Quote; title: string }) {
  const positive = quote.change24h >= 0;
  return (
    <article className={`luxury-market-card luxury-market-card--${quote.metal.toLowerCase()}`}>
      <div className="luxury-market-card__topline">
        <span className="luxury-market-card__eyebrow">قیمت لحظه‌ای بازار</span>
        <span className={positive ? "market-change market-change--up" : "market-change market-change--down"}>
          {positive ? "+" : ""}{quote.change24h.toLocaleString("fa-IR")}٪
        </span>
      </div>
      <h3>{title}</h3>
      <strong>{formatPrice(quote.price)} تومان</strong>
      <p>{quote.stale ? "در حال همگام‌سازی با بازار" : "به‌روزرسانی خودکار هر ۵ دقیقه"}</p>
    </article>
  );
}

export function MarketOverview() {
  const [quotes, setQuotes] = useState<MarketData>({
    gold: emptyQuote("GOLD"),
    silver: emptyQuote("SILVER"),
  });

  useEffect(() => {
    fetch("/api/market", { cache: "no-store" })
      .then((response) => (response.ok ? response.json() : Promise.reject()))
      .then((data: MarketData) => setQuotes(data))
      .catch(() => undefined);
  }, []);

  return (
    <section className="luxury-market-section" aria-labelledby="market-overview-title">
      <Container>
        <div className="section-title luxury-market-heading">
          <span>Live Precious Metals</span>
          <h2 id="market-overview-title">نبض بازار فلزات گران‌بها</h2>
          <p>قیمت‌ها از مسیر امن سرور دریافت و هر پنج دقیقه تازه‌سازی می‌شوند.</p>
        </div>
        <div className="luxury-market-grid">
          <QuoteCard quote={quotes.gold} title="طلای ۱۸ عیار" />
          <QuoteCard quote={quotes.silver} title="نقره خالص" />
        </div>
      </Container>
    </section>
  );
}
