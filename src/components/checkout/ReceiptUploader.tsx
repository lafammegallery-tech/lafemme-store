"use client";
import { useRef, useState } from "react";
import Image from "next/image";

/** بارگذاری تصویر رسید کارت‌به‌کارت پس از ثبت سفارش. */
export function ReceiptUploader({ orderNumber, alreadyUploaded }: { orderNumber: string; alreadyUploaded?: boolean }) {
  const [url, setUrl] = useState("");
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(Boolean(alreadyUploaded));
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setError("");
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      fd.append("orderNumber", orderNumber);
      const res = await fetch("/api/receipt/upload", { method: "POST", body: fd });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "خطا در بارگذاری رسید");
      setUrl(data.url as string);
      setDone(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "خطا در بارگذاری رسید");
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  if (done) {
    return (
      <div className="receipt-uploader done">
        {url && (
          <div className="receipt-preview">
            <Image src={url} alt="رسید بارگذاری‌شده" width={200} height={260} style={{ objectFit: "cover" }} unoptimized />
          </div>
        )}
        <p className="receipt-success">✓ رسید شما ثبت شد و در انتظار بررسی مدیر است.</p>
      </div>
    );
  }

  return (
    <div className="receipt-uploader">
      {error && <p className="receipt-error">{error}</p>}
      <label className="btn btn-primary receipt-upload-btn">
        {uploading ? "در حال بارگذاری..." : "بارگذاری تصویر رسید واریز"}
        <input ref={inputRef} type="file" accept="image/*" onChange={handleFileChange} disabled={uploading} style={{ display: "none" }} />
      </label>
      <p className="receipt-hint">تصویر واضح از رسید یا اسکرین‌شات تراکنش را بارگذاری کنید (حداکثر ۵ مگابایت).</p>
    </div>
  );
}
