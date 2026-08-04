import { requireAdmin } from "@/backend/auth/session";
import { getPrisma } from "@/backend/database/prisma";
import { toggleProductAction } from "@/app/actions/admin";
import { PageLayout, PageHero } from "@/components/common";
import Link from "next/link";
import Image from "next/image";
import { Container, Card, Button, PriceDisplay } from "@/components/ui";

export const dynamic = "force-dynamic";

export default async function Page() {
  await requireAdmin();

  const items = await getPrisma().product.findMany({
    where: { deletedAt: null },
    include: { category: true, inventory: true },
    orderBy: { updatedAt: "desc" },
  });

  return (
    <PageLayout>
      <PageHero title="مدیریت محصولات" description="وضعیت، قیمت و موجودی محصولات" />
      <section className="py-12">
        <Container>
          <div className="py-6 flex gap-4">
            <Link href="/admin/products/new" className="btn btn-primary">
              افزودن محصول جدید
            </Link>
          </div>
          <div className="grid gap-4">
            {items.map((x) => (
              <Card key={x.id} className="p-5">
                <div className="flex flex-wrap justify-between gap-4">
                  <div className="flex gap-4 items-start">
                    {x.image && (
                      <div style={{ flexShrink: 0, width: 72, height: 72, borderRadius: 8, overflow: "hidden", border: "1px solid var(--color-border)" }}>
                        <Image src={x.image} alt={x.name} width={72} height={72} style={{ objectFit: "cover", width: "100%", height: "100%" }} unoptimized />
                      </div>
                    )}
                    <div>
                      <h2 style={{ marginBottom: "0.25rem" }}>{x.name}</h2>
                      <p style={{ color: "var(--color-gray)", fontSize: "0.9rem" }}>
                        {x.category.name} • {x.metalType} • {x.weight ?? "—"}
                      </p>
                      <p style={{ color: "var(--color-gray)", fontSize: "0.85rem" }}>
                        وضعیت: <strong style={{ color: x.status === "ACTIVE" ? "var(--color-success)" : "var(--color-danger)" }}>{x.status}</strong>
                        {" | "}
                        موجودی: {x.inventory?.quantity ?? x.stock}
                        {x.purity && ` | عیار: ${x.purity}`}
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-col gap-3 items-end">
                    <PriceDisplay value={Number(x.price)} />
                    <div className="flex gap-2">
                      <Link
                        href={`/admin/products/${x.id}/edit`}
                        style={{
                          padding: "8px 16px",
                          background: "var(--color-surface-raised)",
                          border: "1px solid var(--color-border)",
                          borderRadius: "8px",
                          color: "var(--color-white)",
                          fontSize: "0.85rem",
                          textDecoration: "none",
                        }}
                      >
                        ویرایش
                      </Link>
                      <form action={toggleProductAction}>
                        <input type="hidden" name="id" value={x.id} />
                        <Button type="submit" variant="secondary">
                          {x.status === "ACTIVE" ? "غیرفعال‌کردن" : "فعال‌کردن"}
                        </Button>
                      </form>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </Container>
      </section>
    </PageLayout>
  );
}
