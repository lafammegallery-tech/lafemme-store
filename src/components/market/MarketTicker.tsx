"use client";
import { useEffect, useState } from "react";

interface Quote {
  price: number;
  change24h: number;
  stale: boolean;
  isFallback?: boolean;
  isManual?: boolean;
}

interface MarketData {
  gold750: Quote;
  gold995: Quote;
  silver999: Quote;
  isManualMode?: boolean;
}

const zero: Quote = { price: 0, change24h: 0, stale: true };
const initial: MarketData = { gold750: zero, gold995: zero, silver999: zero };

function formatIRR(v: number): string {
  return v > 0
    ? new Intl.NumberFormat("fa-IR").format(v) + " تومان"
    : "در حال دریافت";
}

function ChangeTag({ value, stale }: { value: number; stale: boolean }) {
  if (stale) return <span className="market-stale">---</span>;
  const up = value >= 0;
  return (
    <span className={up ? "market-up" : "market-down"}>
      {up ? "▲" : "▼"} {Math.abs(value).toLocaleString("fa-IR")}٪
    </span>
  );
}

export function MarketTicker() {
  const [data, setData] = useState<MarketData>(initial);

  useEffect(() => {
    let active = true;
    const load = async () => {
      try {
        const res = await fetch("/api/market", { cache: "no-store" });
        if (!res.ok) return;
        const payload = (await res.json()) as MarketData;
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
        <span className="market-label">طلا عیار ۹۹۵</span>
        <span>{formatIRR(data.gold995.price)}</span>
        <ChangeTag value={data.gold995.change24h} stale={data.gold995.stale} />
      </div>
      <div className="market-item gold">
        <span className="market-label">طلا عیار ۷۵۰</span>
        <span>{formatIRR(data.gold750.price)}</span>
        <ChangeTag value={data.gold750.change24h} stale={data.gold750.stale} />
      </div>
      <div className="market-item silver">
        <span className="market-label">نقره ۹۹۹</span>
        <span>{formatIRR(data.silver999.price)}</span>
        <ChangeTag value={data.silver999.change24h} stale={data.silver999.stale} />
      </div>
      {data.isManualMode && (
        <div className="market-item" style={{ color: "var(--color-warning)", fontSize: "0.8rem" }}>
          حالت دستی
        </div>
      )}
      <div className="market-time">بروزرسانی خودکار: هر ۵ دقیقه</div>
    </div>
  );
}
