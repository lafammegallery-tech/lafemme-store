"use client";

import { useRef, useState } from "react";
import Image from "next/image";

interface Props {
  name?: string;
  defaultUrl?: string;
}

export default function ImageUploader({ name = "imageUrl", defaultUrl = "" }: Props) {
  const [url, setUrl] = useState(defaultUrl);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setError("");
    setUploading(true);

    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/admin/upload", { method: "POST", body: fd });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "خطا در آپلود");
      setUrl(data.url as string);
    } catch (err) {
      setError(err instanceof Error ? err.message : "خطا در آپلود تصویر");
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
      <label style={{ color: "var(--color-gray)", fontSize: "0.85rem" }}>تصویر محصول</label>

      {url && (
        <div style={{ position: "relative", width: 160, height: 160, borderRadius: 12, overflow: "hidden", border: "1px solid var(--color-border)" }}>
          <Image src={url} alt="پیش‌نمایش تصویر" fill style={{ objectFit: "cover" }} unoptimized />
          <button
            type="button"
            onClick={() => setUrl("")}
            style={{
              position: "absolute",
              top: 6,
              left: 6,
              background: "rgba(0,0,0,0.6)",
              color: "#fff",
              border: "none",
              borderRadius: "50%",
              width: 24,
              height: 24,
              cursor: "pointer",
              fontSize: 14,
              lineHeight: "24px",
              textAlign: "center",
            }}
          >
            ×
          </button>
        </div>
      )}

      <input type="hidden" name={name} value={url} />

      <label
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: "0.5rem",
          padding: "10px 20px",
          background: "var(--color-surface-raised)",
          border: "1px solid var(--color-border)",
          borderRadius: "10px",
          color: "var(--color-white)",
          fontSize: "0.9rem",
          cursor: uploading ? "wait" : "pointer",
          width: "fit-content",
          opacity: uploading ? 0.6 : 1,
        }}
      >
        {uploading ? "در حال آپلود..." : url ? "تغییر تصویر" : "انتخاب تصویر"}
        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          onChange={handleFileChange}
          disabled={uploading}
          style={{ display: "none" }}
        />
      </label>

      {error && (
        <p style={{ color: "var(--color-danger)", fontSize: "0.85rem" }}>{error}</p>
      )}
      <small style={{ color: "var(--color-gray)", fontSize: "0.8rem" }}>
        فرمت‌های مجاز: JPG، PNG، WebP — حداکثر ۵ مگابایت
      </small>
    </div>
  );
}
