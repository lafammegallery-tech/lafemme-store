"use client";

import { useState } from "react";
import { Input, Textarea, Button } from "@/components/ui";
import ImageUploader from "./ImageUploader";
import PriceCalculator from "./PriceCalculator";

interface Category {
  id: string;
  name: string;
}

interface Props {
  action: (formData: FormData) => Promise<void>;
  cats: Category[];
  defaults?: {
    id?: string;
    name?: string;
    slug?: string;
    sku?: string;
    categoryId?: string;
    metalType?: string;
    weight?: string;
    weightValue?: string | number | null;
    purity?: string;
    price?: string;
    premiumPercent?: string | number;
    fixedPremium?: string | number;
    stock?: string | number;
    shortDescription?: string;
    isFeatured?: boolean;
    imageUrl?: string;
  };
  submitLabel?: string;
}

export default function ProductForm({ action, cats, defaults = {}, submitLabel = "ثبت محصول" }: Props) {
  const [metalType, setMetalType] = useState(defaults.metalType ?? "GOLD");
  const [weightValue, setWeightValue] = useState(String(defaults.weightValue ?? ""));
  const [premiumPercent, setPremiumPercent] = useState(String(defaults.premiumPercent ?? "0"));

  return (
    <form action={action} className="grid gap-6 max-w-2xl py-10">
      {defaults.id && <input type="hidden" name="id" value={defaults.id} />}

      {/* اطلاعات اصلی */}
      <fieldset className="grid gap-4">
        <legend style={{ color: "var(--color-gold)", fontWeight: 700, marginBottom: "1rem" }}>اطلاعات اصلی</legend>
        <Input name="name" placeholder="نام محصول" defaultValue={defaults.name ?? ""} required />
        <Input name="slug" placeholder="slug-english (اختیاری — اگر خالی باشد خودکار ساخته می‌شود)" dir="ltr" defaultValue={defaults.slug ?? ""} />
        <Input name="sku" placeholder="SKU (اختیاری)" dir="ltr" defaultValue={defaults.sku ?? ""} />

        <div>
          <label style={{ display: "block", marginBottom: "0.5rem", color: "var(--color-gray)", fontSize: "0.85rem" }}>دسته‌بندی *</label>
          <select
            name="categoryId"
            required
            defaultValue={defaults.categoryId ?? ""}
            style={{ width: "100%", padding: "12px 14px", background: "var(--color-surface-raised)", border: "1px solid var(--color-border)", borderRadius: "12px", color: "var(--color-white)", fontSize: "1rem" }}
          >
            <option value="">انتخاب دسته‌بندی...</option>
            {cats.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>

        <div>
          <label style={{ display: "block", marginBottom: "0.5rem", color: "var(--color-gray)", fontSize: "0.85rem" }}>نوع فلز</label>
          <select
            name="metalType"
            value={metalType}
            onChange={(e) => setMetalType(e.target.value)}
            style={{ width: "100%", padding: "12px 14px", background: "var(--color-surface-raised)", border: "1px solid var(--color-border)", borderRadius: "12px", color: "var(--color-white)", fontSize: "1rem" }}
          >
            <option value="GOLD">طلا</option>
            <option value="SILVER">نقره</option>
            <option value="PLATINUM">پلاتین</option>
          </select>
        </div>
      </fieldset>

      {/* وزن و عیار */}
      <fieldset className="grid gap-4">
        <legend style={{ color: "var(--color-gold)", fontWeight: 700, marginBottom: "1rem" }}>وزن و خلوص</legend>
        <div className="grid gap-4" style={{ gridTemplateColumns: "1fr 1fr" }}>
          <Input name="weight" placeholder="وزن نمایشی — مثال: ۵ گرم" defaultValue={defaults.weight ?? ""} />
          <Input
            name="weightValue"
            type="number"
            step="0.001"
            min="0"
            placeholder="وزن عددی (گرم)"
            dir="ltr"
            value={weightValue}
            onChange={(e) => setWeightValue(e.target.value)}
          />
        </div>
        <Input name="purity" placeholder="عیار — مثال: عیار ۱۸ یا 750" defaultValue={defaults.purity ?? ""} />
      </fieldset>

      {/* قیمت‌گذاری */}
      <fieldset className="grid gap-4">
        <legend style={{ color: "var(--color-gold)", fontWeight: 700, marginBottom: "1rem" }}>قیمت‌گذاری</legend>

        {/* نمایش زنده قیمت بازار */}
        <PriceCalculator
          metalType={metalType}
          weightValue={weightValue}
          premiumPercent={premiumPercent}
        />

        <Input name="price" type="number" min="0" placeholder="قیمت پشتیبان (تومان) — از دکمه اعمال بالا یا وارد کنید" required dir="ltr" defaultValue={defaults.price ?? ""} />
        <div className="grid gap-4" style={{ gridTemplateColumns: "1fr 1fr" }}>
          <div>
            <Input
              name="premiumPercent"
              type="number"
              step="0.001"
              min="0"
              placeholder="درصد سود (٪)"
              dir="ltr"
              value={premiumPercent}
              onChange={(e) => setPremiumPercent(e.target.value)}
            />
            <small style={{ color: "var(--color-gray)", fontSize: "0.8rem" }}>درصد سود روی قیمت فلز</small>
          </div>
          <div>
            <Input name="fixedPremium" type="number" min="0" placeholder="سود ثابت (تومان)" dir="ltr" defaultValue={String(defaults.fixedPremium ?? "0")} />
            <small style={{ color: "var(--color-gray)", fontSize: "0.8rem" }}>مبلغ ثابت علاوه بر قیمت فلز</small>
          </div>
        </div>
      </fieldset>

      {/* موجودی */}
      <fieldset className="grid gap-4">
        <legend style={{ color: "var(--color-gold)", fontWeight: 700, marginBottom: "1rem" }}>موجودی</legend>
        <Input name="stock" type="number" min="0" placeholder="موجودی انبار" required dir="ltr" defaultValue={String(defaults.stock ?? "0")} />
      </fieldset>

      {/* توضیحات */}
      <fieldset className="grid gap-4">
        <legend style={{ color: "var(--color-gold)", fontWeight: 700, marginBottom: "1rem" }}>توضیحات</legend>
        <Textarea name="shortDescription" placeholder="توضیح کوتاه محصول" rows={3} defaultValue={defaults.shortDescription ?? ""} />
      </fieldset>

      {/* تصویر */}
      <fieldset className="grid gap-4">
        <legend style={{ color: "var(--color-gold)", fontWeight: 700, marginBottom: "1rem" }}>تصویر</legend>
        <ImageUploader name="imageUrl" defaultUrl={defaults.imageUrl ?? ""} />
      </fieldset>

      {/* گزینه‌های نمایش */}
      <fieldset>
        <legend style={{ color: "var(--color-gold)", fontWeight: 700, marginBottom: "1rem" }}>گزینه‌های نمایش</legend>
        <label className="flex items-center gap-3">
          <input type="checkbox" name="isFeatured" defaultChecked={defaults.isFeatured ?? false} className="w-5 h-5" />
          <span>نمایش در بخش محصولات ویژه</span>
        </label>
      </fieldset>

      <div className="flex gap-4">
        <Button type="submit">{submitLabel}</Button>
        <a href="/admin/products" style={{ padding: "12px 24px", color: "var(--color-gray)" }}>انصراف</a>
      </div>
    </form>
  );
}
