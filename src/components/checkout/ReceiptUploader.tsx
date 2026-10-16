"use client";
import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { MAX_RECEIPT_BYTES, MAX_RECEIPT_FILES } from "@/lib/staged-payment";
import type { PaymentStage } from "@/generated/prisma/enums";

/** Submit a complete set of bank transfers for a single payment stage. */
export function ReceiptUploader({ orderNumber, stage = "FULL", revision = 0 }: { orderNumber: string; stage?: PaymentStage; revision?: number }) {
  const router = useRouter();
  const [files, setFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  function addFiles(event: React.ChangeEvent<HTMLInputElement>) {
    const selected = [...files, ...Array.from(event.target.files ?? [])];
    if (inputRef.current) inputRef.current.value = "";
    setError("");
    if (selected.length > MAX_RECEIPT_FILES) return setError("حداکثر ۱۰ تصویر در هر مرحله مجاز است.");
    if (selected.some(f => f.size > 5 * 1024 * 1024)) return setError("هر تصویر باید حداکثر ۵ مگابایت باشد.");
    if (selected.reduce((sum, f) => sum + f.size, 0) > MAX_RECEIPT_BYTES) return setError("مجموع تصاویر باید حداکثر ۳۰ مگابایت باشد.");
    setFiles(selected);
  }

  async function upload() {
    setError(""); setUploading(true);
    try {
      const fd = new FormData();
      for (const file of files) fd.append("files", file);
      fd.set("orderNumber", orderNumber); fd.set("stage", stage); fd.set("revision", String(revision));
      const res = await fetch("/api/receipt/upload", { method: "POST", body: fd });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "خطا در بارگذاری رسیدها");
      setDone(true); setFiles([]); router.refresh();
    } catch (err) { setError(err instanceof Error ? err.message : "خطا در بارگذاری رسیدها"); }
    finally { setUploading(false); }
  }

  if (done) return <p role="status" className="receipt-success">✓ تصاویر این مرحله ثبت شد و در انتظار بررسی مدیر است.</p>;
  return (
    <div className="receipt-uploader">
      {error && <p className="receipt-error" role="alert">{error}</p>}
      <label className="btn btn-secondary receipt-upload-btn">
        انتخاب تصویر یا افزودن فیش دیگر
        <input ref={inputRef} type="file" multiple accept="image/jpeg,image/png,image/webp" onChange={addFiles} disabled={uploading} style={{ display: "none" }} />
      </label>
      <ul className="my-4 space-y-2">{files.map((f, i) => <li key={i} className="break-all">{f.name} <button type="button" className="underline" disabled={uploading} onClick={() => setFiles(list => list.filter((_, j) => j !== i))}>حذف تصویر {i + 1}</button></li>)}</ul>
      <p className="receipt-hint">همهٔ فیش‌های این مرحله را پیش از ارسال انتخاب کنید. حداکثر ۱۰ تصویر JPG، PNG یا WebP؛ هر تصویر ۵ و مجموع ۳۰ مگابایت. جمع واریزها باید برابر مبلغ همین مرحله باشد. ارسال به‌تنهایی به معنی تأیید نیست.</p>
      <button type="button" className="btn btn-primary mt-4" disabled={uploading || !files.length} onClick={upload}>{uploading ? "در حال ارسال…" : `ارسال مجموعه رسیدها (${files.length.toLocaleString("fa-IR")} تصویر)`}</button>
    </div>
  );
}
