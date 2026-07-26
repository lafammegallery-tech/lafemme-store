"use client";
import { useState } from "react";
import { Button } from "@/components/ui";

/** دکمه ذخیره قیمت‌های لحظه‌ای در دیتابیس — فقط در پنل ادمین. */
export function MarketSyncButton() {
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  async function handleSync() {
    setStatus("loading");
    setMessage("");
    try {
      const res = await fetch("/api/market", { method: "POST" });
      const data = await res.json() as { saved?: number; skipped?: boolean; error?: string };
      if (!res.ok) throw new Error(data.error ?? "خطای سرور");
      if (data.skipped) {
        setStatus("success");
        setMessage("دیتابیس متصل نیست — قیمت‌ها ذخیره نشدند.");
      } else {
        setStatus("success");
        setMessage(`${data.saved ?? 0} رکورد با موفقیت ذخیره شد.`);
      }
    } catch (err) {
      setStatus("error");
      setMessage(err instanceof Error ? err.message : "خطا در ذخیره قیمت.");
    }
  }

  return (
    <div style={{ display: "flex", alignItems: "center", gap: "16px", flexWrap: "wrap" }}>
      <Button
        onClick={handleSync}
        disabled={status === "loading"}
        className="btn btn-primary"
      >
        {status === "loading" ? "در حال دریافت..." : "ذخیره قیمت فعلی در دیتابیس"}
      </Button>
      {message && (
        <span style={{ color: status === "error" ? "#ff6b6b" : "#2ecc71", fontSize: "0.9rem" }}>
          {message}
        </span>
      )}
    </div>
  );
}
