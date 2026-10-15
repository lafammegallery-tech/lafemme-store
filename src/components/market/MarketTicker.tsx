"use client";
import { formatMoney } from "@/lib/format-money";
import { useMarketData } from "./useMarketData";

interface Quote {
  price: number;
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

const zero: Quote = { price: 0, stale: true };
const initial: MarketData = { gold750: zero, gold995: zero, silver999: zero };

function formatIRR(v: number): string {
  return v > 0
    ? formatMoney(v) + " تومان"
    : "در حال دریافت";
}

export function MarketTicker() {
  const data = useMarketData() ?? initial;

  return (
    <div className="market-wrapper">
      <div className="market-item gold">
        <span className="market-label">طلا عیار ۹۹۵</span>
        <span>{formatIRR(data.gold995.price)}</span>
        {data.gold995.stale && data.gold995.price > 0 && <small className="market-stale">قیمت تأییدنشده</small>}
      </div>
      <div className="market-item gold">
        <span className="market-label">طلا عیار ۷۵۰</span>
        <span>{formatIRR(data.gold750.price)}</span>
        {data.gold750.stale && data.gold750.price > 0 && <small className="market-stale">قیمت تأییدنشده</small>}
      </div>
      <div className="market-item silver">
        <span className="market-label">نقره ۹۹۹</span>
        <span>{formatIRR(data.silver999.price)}</span>
        {data.silver999.stale && data.silver999.price > 0 && <small className="market-stale">قیمت تأییدنشده</small>}
      </div>
      {data.isManualMode && (
        <div className="market-item" style={{ color: "var(--color-warning)", fontSize: "0.8rem" }}>
          حالت دستی
        </div>
      )}
    </div>
  );
}
