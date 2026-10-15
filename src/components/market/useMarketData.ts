"use client";

import { useEffect, useState } from "react";
import type { MarketQuotes } from "@/backend/services/market-price.service";
import { MARKET_REFRESH_MS } from "@/lib/market-refresh";

/** Refresh while mounted; abort on navigation and never overlap slow requests. */
export function useMarketData() {
  const [data, setData] = useState<MarketQuotes | null>(null);
  useEffect(() => {
    let active = true;
    let pending: AbortController | null = null;
    const load = async () => {
      if (pending) return;
      const controller = new AbortController();
      pending = controller;
      const timeout = window.setTimeout(() => controller.abort(), 15_000);
      try {
        const response = await fetch("/api/market", { cache: "no-store", signal: controller.signal });
        if (!response.ok) throw new Error("Market unavailable");
        const payload = await response.json() as MarketQuotes;
        if (!payload.gold750 || !payload.gold995 || !payload.silver999 || !payload.gold || !payload.silver) throw new Error("Invalid market response");
        if (active) setData(payload);
      } catch {
        // Retain the last displayed prices but clearly mark them as unconfirmed.
        if (active) setData(previous => previous ? {
          ...previous,
          gold: { ...previous.gold, stale: true },
          gold750: { ...previous.gold750, stale: true },
          gold995: { ...previous.gold995, stale: true },
          silver: { ...previous.silver, stale: true },
          silver999: { ...previous.silver999, stale: true },
        } : null);
      } finally {
        window.clearTimeout(timeout);
        pending = null;
      }
    };
    void load();
    const timer = window.setInterval(() => void load(), MARKET_REFRESH_MS);
    return () => {
      active = false;
      window.clearInterval(timer);
      pending?.abort();
    };
  }, []);
  return data;
}
