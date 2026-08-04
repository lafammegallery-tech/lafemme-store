"use client";

import { useEffect, useRef, useState } from "react";

interface Props {
  metalType: string;
  weightValue: string;
  premiumPercent: string;
}

interface MarketQuote {
  price: number;
  priceToman: number;
  stale: boolean;
  source: string;
}

export default function PriceCalculator({ metalType, weightValue, premiumPercent }: Props) {
  const [quote, setQuote] = useState<MarketQuote | null>(null);
  const [loading, setLoading] = useState(false);
  const priceRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    fetch("/api/market")
      .then((r) => r.json())
      .then((data) => {
        if (cancelled) return;
        const q: MarketQuote =
          metalType === "SILVER" ? data.silver : data.gold750;
        setQuote(q);
        setLoading(false);
        autoFillPrice(q, Number(weightValue), Number(premiumPercent));
      })
      .catch(() => setLoading(false));
    return () => { cancelled = true; };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [metalType]);

  function autoFillPrice(q: MarketQuote, weight: number, premium: number) {
    if (!q || q.stale || q.price <= 0 || weight <= 0) return;
    const metal = q.price;
    const calculated = Math.round(metal * weight * (1 + premium / 100));
    const input = document.querySelector<HTMLInputElement>('input[name="price"]');
    if (input) {
      input.value = String(calculated);
      // fire a native change event so React picks it up
      input.dispatchEvent(new Event("input", { bubbles: true }));
    }
  }

  if (!quote && !loading) return null;

  const weight = Number(weightValue) || 0;
  const premium = Number(premiumPercent) || 0;
  const computed =
    quote && !quote.stale && quote.price > 0 && weight > 0
      ? Math.round(quote.price * weight * (1 + premium / 100))
      : null;

  return (
    <div
      style={{
        padding: "10px 14px",
        background: "var(--color-surface-raised)",
        border: "1px solid var(--color-border)",
        borderRadius: 10,
        fontSize: "0.85rem",
        color: "var(--color-gray)",
        display: "flex",
        flexDirection: "column",
        gap: "0.4rem",
      }}
    >
      {loading && <span>در حال دریافت قیمت بازار...</span>}
      {quote && !quote.stale && (
        <>
          <span>
            قیمت بازار ({metalType === "SILVER" ? "نقره" : "طلا ۷۵۰"}):
            {" "}
            <strong style={{ color: "var(--color-gold)" }}>
              {quote.priceToman.toLocaleString("fa-IR")} تومان
            </strong>
            {" "}— منبع: {quote.source}
          </span>
          {computed !== null && (
            <span>
              قیمت پیشنهادی ({weight} گرم + {premium}٪ سود):
              {" "}
              <strong style={{ color: "var(--color-white)" }}>
                {computed.toLocaleString("fa-IR")} تومان
              </strong>
              {" "}
              <button
                type="button"
                ref={priceRef as React.RefObject<HTMLButtonElement>}
                onClick={() => autoFillPrice(quote, weight, premium)}
                style={{
                  marginRight: "0.5rem",
                  padding: "2px 10px",
                  background: "var(--color-gold)",
                  color: "#000",
                  border: "none",
                  borderRadius: 6,
                  cursor: "pointer",
                  fontSize: "0.8rem",
                  fontWeight: 700,
                }}
              >
                اعمال
              </button>
            </span>
          )}
        </>
      )}
      {quote?.stale && <span style={{ color: "var(--color-danger)" }}>قیمت بازار در دسترس نیست</span>}
    </div>
  );
}
