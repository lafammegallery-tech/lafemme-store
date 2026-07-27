import { requireAdmin } from "@/backend/auth/session";
import { getPrisma } from "@/backend/database/prisma";
import { toggleUserAdminAction } from "@/app/actions/admin";
import { PageLayout, PageHero } from "@/components/common";
import { Container, Card, Button } from "@/components/ui";
export const dynamic = "force-dynamic";
export default async function Page() {
  const session = await requireAdmin();
  const users = await getPrisma().user.findMany({
    where: { deletedAt: null },
    include: { _count: { select: { orders: true, addresses: true } } },
    orderBy: { createdAt: "desc" },
    take: 100,
  });
  return (
    <PageLayout>
      <PageHero title="کاربران" description="نمایش حساب‌ها، فعالیت خرید و مدیریت دسترسی مدیر" />
      <section className="py-12">
        <Container>
          <div className="grid gap-3">
            {users.map((u) => (
              <Card key={u.id} className="p-5">
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div>
                    <h2>{[u.firstName, u.lastName].filter(Boolean).join(" ") || "کاربر"}</h2>
                    <p>
                      {u.phone} • {u.email || "بدون ایمیل"}
                    </p>
                    <p>
                      نقش: {u.role} | سفارش‌ها: {u._count.orders} | آدرس‌ها: {u._count.addresses}
                    </p>
                  </div>
                  {u.id !== session.userId && (
                    <form action={toggleUserAdminAction}>
                      <input type="hidden" name="id" value={u.id} />
                      <Button type="submit" variant="secondary" size="sm">
                        {u.role === "ADMIN" ? "حذف دسترسی مدیر" : "ارتقا به مدیر"}
                      </Button>
                    </form>
                  )}
                </div>
              </Card>
            ))}
          </div>
        </Container>
      </section>
    </PageLayout>
  );
}
