"use client";

import { useEffect, useState } from "react";

interface Quote {
  price: number;
  change24h: number;
  stale: boolean;
}

interface MarketData {
  gold: Quote;
  silver: Quote;
}

const initialData: MarketData = {
  gold: { price: 0, change24h: 0, stale: true },
  silver: { price: 0, change24h: 0, stale: true },
};

function formatPrice(value: number): string {
  return value > 0
    ? `${new Intl.NumberFormat("fa-IR", { maximumFractionDigits: 2 }).format(value)} تومان`
    : "در حال دریافت";
}

export function MarketTicker() {
  const [data, setData] = useState(initialData);

  useEffect(() => {
    let active = true;

    const load = async () => {
      try {
        const response = await fetch("/api/market", { cache: "no-store" });
        if (!response.ok) return;
        const payload = (await response.json()) as MarketData;
        if (active) setData(payload);
      } catch {
        // رابط کاربری با مقدار امن قبلی ادامه می‌دهد.
      }
    };

    void load();
    const timer = window.setInterval(load, 300_000);
    return () => {
      active = false;
      window.clearInterval(timer);
    };
  }, []);

  return (
    <div className="market-wrapper">
      <div className="market-item gold">
        <span className="market-label">🟡 طلای ۱۸ عیار</span>
        <span>{formatPrice(data.gold.price)}</span>
        <span className={data.gold.change24h >= 0 ? "market-up" : "market-down"}>
          {data.gold.change24h >= 0 ? "▲" : "▼"} {data.gold.change24h.toLocaleString("fa-IR")}٪
        </span>
      </div>
      <div className="market-item silver">
        <span className="market-label">⚪ نقره</span>
        <span>{formatPrice(data.silver.price)}</span>
        <span className={data.silver.change24h >= 0 ? "market-up" : "market-down"}>
          {data.silver.change24h >= 0 ? "▲" : "▼"} {data.silver.change24h.toLocaleString("fa-IR")}٪
        </span>
      </div>
      <div className="market-time">بروزرسانی خودکار: هر ۵ دقیقه</div>
    </div>
  );
}
