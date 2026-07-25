import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { AccountLayout } from "@/components/account/AccountLayout";
import { PageHero, PageLayout } from "@/components/common";
import { Card, EmptyState } from "@/components/ui";
import { mockFavorites } from "@/data/frontend";

export const metadata: Metadata = {
  title: "علاقه‌مندی‌ها | La Femme",
  description: "محصولات مورد علاقه شما",
  robots: { index: false, follow: false },
};

/** صفحه محصولات مورد علاقه با داده موقت. */
export default function FavoritesPage() {
  return (
    <PageLayout>
      <PageHero title="علاقه‌مندی‌ها" description="محصولاتی که نشان کرده‌اید" />
      <section className="py-16">
        <AccountLayout>
          <Card className="dashboard-card p-6">
            <h1>علاقه‌مندی‌های من</h1>

            {mockFavorites.length > 0 ? (
              <div className="products-grid mt-6">
                {mockFavorites.map((item) => (
                  <article key={item.id} className="product-card">
                    <div className="product-image">
                      <Image
                        src={item.imageSrc}
                        alt={item.name}
                        width={420}
                        height={420}
                        sizes="(max-width: 700px) 100vw, (max-width: 1100px) 50vw, 33vw"
                        className="product-card-image"
                      />
                    </div>
                    <div className="product-content">
                      <h3>{item.name}</h3>
                      <div className="product-price">
                        {new Intl.NumberFormat("fa-IR").format(item.price)} تومان
                      </div>
                      <Link href={item.href} className="btn btn-primary">
                        مشاهده محصول
                      </Link>
                    </div>
                  </article>
                ))}
              </div>
            ) : (
              <EmptyState
                title="لیست علاقه‌مندی‌ها خالی است"
                description="محصولات مورد علاقه خود را اینجا مشاهده خواهید کرد."
              />
            )}
          </Card>
        </AccountLayout>
      </section>
    </PageLayout>
  );
}
