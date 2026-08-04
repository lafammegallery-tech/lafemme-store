import { requireAdmin } from "@/backend/auth/session";
import { getPrisma } from "@/backend/database/prisma";
import { updateProductAction } from "@/app/actions/admin";
import { PageLayout, PageHero } from "@/components/common";
import { Container } from "@/components/ui";
import { notFound } from "next/navigation";
import ProductForm from "@/components/admin/ProductForm";

export const dynamic = "force-dynamic";

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  await requireAdmin();
  const { id } = await params;

  const product = await getPrisma().product.findUnique({
    where: { id, deletedAt: null },
    include: { category: true, inventory: true },
  });

  if (!product) notFound();

  const cats = await getPrisma().category.findMany({
    where: { isActive: true, deletedAt: null },
    orderBy: { name: "asc" },
    select: { id: true, name: true },
  });

  return (
    <PageLayout>
      <PageHero title={`ویرایش: ${product.name}`} description="ویرایش اطلاعات، قیمت و موجودی محصول" />
      <Container>
        <ProductForm
          action={updateProductAction}
          cats={cats}
          submitLabel="ذخیره تغییرات"
          defaults={{
            id: product.id,
            name: product.name,
            slug: product.slug,
            sku: product.sku ?? "",
            categoryId: product.categoryId,
            metalType: product.metalType,
            weight: product.weight ?? "",
            weightValue: product.weightValue ?? "",
            purity: product.purity ?? "",
            price: String(product.price),
            premiumPercent: String(product.premiumPercent),
            fixedPremium: String(product.fixedPremium),
            stock: product.inventory?.quantity ?? product.stock,
            shortDescription: product.shortDescription ?? "",
            isFeatured: product.isFeatured,
            imageUrl: product.image ?? "",
          }}
        />
      </Container>
    </PageLayout>
  );
}
