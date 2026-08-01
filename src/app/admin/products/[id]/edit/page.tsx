import { requireAdmin } from "@/backend/auth/session";
import { getPrisma } from "@/backend/database/prisma";
import { updateProductAction } from "@/app/actions/admin";
import { PageLayout, PageHero } from "@/components/common";
import { Container, Input, Textarea, Button } from "@/components/ui";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  await requireAdmin();
  const { id } = await params;

  const product = await getPrisma().product.findUnique({
    where: { id, deletedAt: null },
    include: {
      category: true,
      inventory: true,
    },
  });

  if (!product) notFound();

  const cats = await getPrisma().category.findMany({
    where: { isActive: true, deletedAt: null },
    orderBy: { name: "asc" },
  });

  return (
    <PageLayout>
      <PageHero
        title={`ویرایش: ${product.name}`}
        description="ویرایش اطلاعات، قیمت و موجودی محصول"
      />
      <Container>
        <form action={updateProductAction} className="grid gap-6 max-w-2xl py-10">
          <input type="hidden" name="id" value={product.id} />

          {/* اطلاعات اصلی */}
          <fieldset className="grid gap-4">
            <legend style={{ color: "var(--color-gold)", fontWeight: 700, marginBottom: "1rem" }}>اطلاعات اصلی</legend>
            <Input name="name" placeholder="نام محصول" defaultValue={product.name} required />
            <Input name="slug" placeholder="slug-english" dir="ltr" defaultValue={product.slug} required />
            <Input name="sku" placeholder="SKU (اختیاری)" dir="ltr" defaultValue={product.sku ?? ""} />

            <div>
              <label style={{ display: "block", marginBottom: "0.5rem", color: "var(--color-gray)", fontSize: "0.85rem" }}>
                دسته‌بندی *
              </label>
              <select
                name="categoryId"
                required
                defaultValue={product.categoryId}
                style={{
                  width: "100%",
                  padding: "12px 14px",
                  background: "var(--color-surface-raised)",
                  border: "1px solid var(--color-border)",
                  borderRadius: "12px",
                  color: "var(--color-white)",
                  fontSize: "1rem",
                }}
              >
                {cats.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label style={{ display: "block", marginBottom: "0.5rem", color: "var(--color-gray)", fontSize: "0.85rem" }}>
                نوع فلز
              </label>
              <select
                name="metalType"
                defaultValue={product.metalType}
                style={{
                  width: "100%",
                  padding: "12px 14px",
                  background: "var(--color-surface-raised)",
                  border: "1px solid var(--color-border)",
                  borderRadius: "12px",
                  color: "var(--color-white)",
                  fontSize: "1rem",
                }}
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
              <Input name="weight" placeholder="وزن نمایشی — مثال: ۵ گرم" defaultValue={product.weight ?? ""} />
              <Input
                name="weightValue"
                type="number"
                step="0.001"
                min="0"
                placeholder="وزن عددی (گرم)"
                dir="ltr"
                defaultValue={product.weightValue ?? ""}
              />
            </div>
            <Input name="purity" placeholder="عیار — مثال: عیار ۱۸ یا 750" defaultValue={product.purity ?? ""} />
          </fieldset>

          {/* قیمت‌گذاری */}
          <fieldset className="grid gap-4">
            <legend style={{ color: "var(--color-gold)", fontWeight: 700, marginBottom: "1rem" }}>قیمت‌گذاری</legend>
            <Input
              name="price"
              type="number"
              min="0"
              placeholder="قیمت پایه / fallback (تومان)"
              required
              dir="ltr"
              defaultValue={String(product.price)}
            />
            <div className="grid gap-4" style={{ gridTemplateColumns: "1fr 1fr" }}>
              <div>
                <Input
                  name="premiumPercent"
                  type="number"
                  step="0.001"
                  min="0"
                  placeholder="درصد سود (٪)"
                  dir="ltr"
                  defaultValue={String(product.premiumPercent)}
                />
                <small style={{ color: "var(--color-gray)", fontSize: "0.8rem" }}>
                  درصد سود روی قیمت فلز — مثال: 7 برای ۷٪
                </small>
              </div>
              <div>
                <Input
                  name="fixedPremium"
                  type="number"
                  min="0"
                  placeholder="سود ثابت (تومان)"
                  dir="ltr"
                  defaultValue={String(product.fixedPremium)}
                />
                <small style={{ color: "var(--color-gray)", fontSize: "0.8rem" }}>
                  مبلغ ثابت علاوه بر قیمت فلز
                </small>
              </div>
            </div>
          </fieldset>

          {/* موجودی */}
          <fieldset className="grid gap-4">
            <legend style={{ color: "var(--color-gold)", fontWeight: 700, marginBottom: "1rem" }}>موجودی</legend>
            <Input
              name="stock"
              type="number"
              min="0"
              placeholder="موجودی انبار"
              required
              dir="ltr"
              defaultValue={product.inventory?.quantity ?? product.stock}
            />
          </fieldset>

          {/* توضیحات */}
          <fieldset className="grid gap-4">
            <legend style={{ color: "var(--color-gold)", fontWeight: 700, marginBottom: "1rem" }}>توضیحات</legend>
            <Textarea
              name="shortDescription"
              placeholder="توضیح کوتاه محصول"
              rows={3}
              defaultValue={product.shortDescription ?? ""}
            />
          </fieldset>

          {/* گزینه‌های نمایش */}
          <fieldset>
            <legend style={{ color: "var(--color-gold)", fontWeight: 700, marginBottom: "1rem" }}>گزینه‌های نمایش</legend>
            <label className="flex items-center gap-3">
              <input
                type="checkbox"
                name="isFeatured"
                defaultChecked={product.isFeatured}
                className="w-5 h-5"
              />
              <span>نمایش در بخش محصولات ویژه</span>
            </label>
          </fieldset>

          <div className="flex gap-4">
            <Button type="submit">ذخیره تغییرات</Button>
            <a href="/admin/products" style={{ padding: "12px 24px", color: "var(--color-gray)" }}>
              انصراف
            </a>
          </div>
        </form>
      </Container>
    </PageLayout>
  );
}
