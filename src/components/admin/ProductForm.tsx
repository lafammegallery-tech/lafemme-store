"use client";

import { useState } from "react";
import { Input, Textarea, Button, Field, Checkbox, Select } from "@/components/ui";
import MultiImageUploader from "./MultiImageUploader";
import PriceCalculator from "./PriceCalculator";
import { MoneyInput } from "@/components/ui/MoneyInput";

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
    imageUrls?: string[];
  };
  submitLabel?: string;
}

export default function ProductForm({
  action,
  cats,
  defaults = {},
  submitLabel = "ثبت محصول",
}: Props) {
  const [metalType, setMetalType] = useState(defaults.metalType ?? "GOLD");
  const [weightValue, setWeightValue] = useState(String(defaults.weightValue ?? ""));
  const [premiumPercent, setPremiumPercent] = useState(String(defaults.premiumPercent ?? "0"));
  const [price, setPrice] = useState(defaults.price ?? "");

  return (
    <form action={action} className="product-editor-form grid gap-6 max-w-2xl py-10">
      {defaults.id && <input type="hidden" name="id" value={defaults.id} />}

      {/* اطلاعات اصلی */}
      <fieldset className="grid gap-4">
        <legend style={{ color: "var(--color-gold)", fontWeight: 700, marginBottom: "1rem" }}>
          اطلاعات اصلی
        </legend>
        <Field label="نام محصول"><Input name="name" placeholder="مثلاً شمش طلای ۱ گرمی" defaultValue={defaults.name ?? ""} required /></Field>
        <Field label="نامک انگلیسی (اختیاری)" hint="اگر خالی باشد، خودکار ساخته می‌شود.">
        <Input
          name="slug"
          placeholder="gold-bar-1g"
          dir="ltr"
          defaultValue={defaults.slug ?? ""}
        />
        </Field>
        <Field label="کد محصول (اختیاری)"><Input name="sku" placeholder="SKU" dir="ltr" defaultValue={defaults.sku ?? ""} /></Field>

        <Field label="دسته‌بندی">
          <Select
            name="categoryId"
            required
            defaultValue={defaults.categoryId ?? ""}
          >
            <option value="">انتخاب دسته‌بندی...</option>
            {cats.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </Select>
        </Field>

        <Field label="نوع فلز">
          <Select
            name="metalType"
            value={metalType}
            onChange={(e) => setMetalType(e.target.value)}
          >
            <option value="GOLD">طلا</option>
            <option value="SILVER">نقره</option>
            <option value="PLATINUM">پلاتین</option>
          </Select>
        </Field>
      </fieldset>

      {/* وزن و عیار */}
      <fieldset className="grid gap-4">
        <legend style={{ color: "var(--color-gold)", fontWeight: 700, marginBottom: "1rem" }}>
          وزن و خلوص
        </legend>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="وزن نمایشی">
          <Input
            name="weight"
            placeholder="وزن نمایشی — مثال: ۵ گرم"
            defaultValue={defaults.weight ?? ""}
          />
          </Field>
          <Field label="وزن عددی (گرم)">
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
          </Field>
        </div>
        <Field label="عیار و خلوص">
        <Input
          name="purity"
          placeholder="عیار — مثال: عیار ۱۸ یا 750"
          defaultValue={defaults.purity ?? ""}
        />
        </Field>
      </fieldset>

      {/* قیمت‌گذاری */}
      <fieldset className="grid gap-4">
        <legend style={{ color: "var(--color-gold)", fontWeight: 700, marginBottom: "1rem" }}>
          قیمت‌گذاری
        </legend>

        {/* نمایش زنده قیمت بازار */}
        <PriceCalculator
          metalType={metalType}
          weightValue={weightValue}
          premiumPercent={premiumPercent}
          onApply={(value) => setPrice(String(value))}
        />

        <Field label="قیمت پشتیبان (تومان)" hint="می‌توانید از دکمه اعمال در محاسبه‌گر بالا استفاده کنید.">
        <MoneyInput
          name="price"
          placeholder="مبلغ به تومان"
          required
          dir="ltr"
          value={price}
          onValueChange={setPrice}
        />
        </Field>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="درصد سود" hint="درصد سود روی قیمت فلز">
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
          </Field>
          <Field label="سود ثابت (تومان)" hint="مبلغ ثابت علاوه بر قیمت فلز">
            <MoneyInput
              name="fixedPremium"
              placeholder="سود ثابت (تومان)"
              dir="ltr"
              defaultValue={String(defaults.fixedPremium ?? "0")}
            />
          </Field>
        </div>
      </fieldset>

      {/* موجودی */}
      <fieldset className="grid gap-4">
        <legend style={{ color: "var(--color-gold)", fontWeight: 700, marginBottom: "1rem" }}>
          موجودی
        </legend>
        <Field label="موجودی انبار (عدد)">
        <Input
          name="stock"
          type="number"
          min="0"
          placeholder="موجودی انبار"
          required
          dir="ltr"
          defaultValue={String(defaults.stock ?? "0")}
        />
        </Field>
      </fieldset>

      {/* توضیحات */}
      <fieldset className="grid gap-4">
        <legend style={{ color: "var(--color-gold)", fontWeight: 700, marginBottom: "1rem" }}>
          توضیحات
        </legend>
        <Field label="توضیح کوتاه محصول">
        <Textarea
          name="shortDescription"
          placeholder="توضیح کوتاه محصول"
          rows={3}
          defaultValue={defaults.shortDescription ?? ""}
        />
        </Field>
      </fieldset>

      {/* تصاویر */}
      <fieldset className="grid gap-4">
        <legend style={{ color: "var(--color-gold)", fontWeight: 700, marginBottom: "1rem" }}>
          تصاویر محصول
        </legend>
        <MultiImageUploader
          name="imageUrls"
          defaultUrls={defaults.imageUrls ?? (defaults.imageUrl ? [defaults.imageUrl] : [])}
        />
      </fieldset>

      {/* گزینه‌های نمایش */}
      <fieldset>
        <legend style={{ color: "var(--color-gold)", fontWeight: 700, marginBottom: "1rem" }}>
          گزینه‌های نمایش
        </legend>
          <Checkbox
            name="isFeatured"
            defaultChecked={defaults.isFeatured ?? false}
            label="نمایش در بخش محصولات ویژه"
          />
      </fieldset>

      <div className="flex gap-4">
        <Button type="submit">{submitLabel}</Button>
        <a href="/admin/products" style={{ padding: "12px 24px", color: "var(--color-gray)" }}>
          انصراف
        </a>
      </div>
    </form>
  );
}
