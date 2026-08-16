"use client";

import { useRef, useState } from "react";
import Image from "next/image";

interface Props {
  /** نام فیلد مخفی که آرایه‌ی URL تصاویر را به‌صورت JSON نگه می‌دارد. */
  name?: string;
  defaultUrls?: string[];
}

/**
 * آپلود چند تصویر برای محصول. اولین تصویر به‌عنوان تصویر اصلی در نظر گرفته می‌شود.
 * خروجی: یک فیلد مخفی با آرایه‌ی JSON از URLها به ترتیب نمایش.
 */
export default function MultiImageUploader({ name = "imageUrls", defaultUrls = [] }: Props) {
  const [urls, setUrls] = useState<string[]>(defaultUrls);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleFiles(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    if (!files.length) return;
    setError("");
    setUploading(true);
    try {
      const uploaded: string[] = [];
      for (const file of files) {
        const fd = new FormData();
        fd.append("file", file);
        const res = await fetch("/api/admin/upload", { method: "POST", body: fd });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error ?? "خطا در آپلود");
        uploaded.push(data.url as string);
      }
      setUrls((prev) => [...prev, ...uploaded]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "خطا در آپلود تصویر");
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  function remove(idx: number) {
    setUrls((prev) => prev.filter((_, i) => i !== idx));
  }

  function move(idx: number, dir: -1 | 1) {
    setUrls((prev) => {
      const next = [...prev];
      const target = idx + dir;
      if (target < 0 || target >= next.length) return prev;
      [next[idx], next[target]] = [next[target], next[idx]];
      return next;
    });
  }

  return (
    <div className="multi-uploader">
      <input type="hidden" name={name} value={JSON.stringify(urls)} />

      {urls.length > 0 && (
        <div className="multi-uploader-grid">
          {urls.map((url, idx) => (
            <div key={url + idx} className={`multi-uploader-item${idx === 0 ? " is-primary" : ""}`}>
              <Image src={url} alt={`تصویر ${idx + 1}`} fill style={{ objectFit: "cover" }} unoptimized />
              {idx === 0 && <span className="multi-uploader-badge">تصویر اصلی</span>}
              <div className="multi-uploader-controls">
                <button type="button" onClick={() => move(idx, -1)} disabled={idx === 0} aria-label="جابجایی به راست">›</button>
                <button type="button" onClick={() => move(idx, 1)} disabled={idx === urls.length - 1} aria-label="جابجایی به چپ">‹</button>
                <button type="button" className="multi-uploader-remove" onClick={() => remove(idx)} aria-label="حذف">×</button>
              </div>
            </div>
          ))}
        </div>
      )}

      <label className={`multi-uploader-add${uploading ? " uploading" : ""}`}>
        {uploading ? "در حال آپلود..." : urls.length ? "افزودن تصویر بیشتر" : "انتخاب تصاویر"}
        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          multiple
          onChange={handleFiles}
          disabled={uploading}
          style={{ display: "none" }}
        />
      </label>

      {error && <p style={{ color: "var(--color-danger)", fontSize: "0.85rem" }}>{error}</p>}
      <small style={{ color: "var(--color-gray)", fontSize: "0.8rem" }}>
        می‌توانید چند تصویر انتخاب کنید. اولین تصویر، تصویر اصلی است — با فلش‌ها ترتیب را تغییر دهید. فرمت: JPG، PNG، WebP — حداکثر ۵ مگابایت.
      </small>
    </div>
  );
}
