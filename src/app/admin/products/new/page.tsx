import { requireAdmin } from "@/backend/auth/session";
import { getPrisma } from "@/backend/database/prisma";
import { createProductAction } from "@/app/actions/admin";
import { PageLayout, PageHero } from "@/components/common";
import { Container } from "@/components/ui";
import ProductForm from "@/components/admin/ProductForm";

export const dynamic = "force-dynamic";

export default async function Page() {
  await requireAdmin();

  const cats = await getPrisma().category.findMany({
    where: { isActive: true, deletedAt: null },
    orderBy: { name: "asc" },
    select: { id: true, name: true },
  });

  return (
    <PageLayout>
      <PageHero title="محصول جدید" description="ثبت محصول و موجودی اولیه" />
      <Container>
        <ProductForm action={createProductAction} cats={cats} submitLabel="ثبت محصول" />
      </Container>
    </PageLayout>
  );
}
