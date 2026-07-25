"use client";
import { useMemo, useState } from "react";
import { Container, EmptyState, SearchBar, Select, Skeleton } from "@/components/ui";
import { ProductCard } from "@/components/products";
import { products } from "@/data/products";

/** رابط جست‌وجو، فیلتر و مرتب‌سازی فقط با داده Mock. */
export function SearchExperience() {
  const [query, setQuery] = useState("");
  const [metal, setMetal] = useState("all");
  const [sort, setSort] = useState("default");
  const [loading, setLoading] = useState(false);
  const results = useMemo(
    () =>
      products
        .filter(
          (p) =>
            p.name.includes(query) &&
            (metal === "all" ||
              (metal === "gold" ? p.name.includes("طلا") : p.name.includes("نقره"))),
        )
        .sort((a, b) =>
          sort === "price-asc" ? a.price - b.price : sort === "price-desc" ? b.price - a.price : 0,
        ),
    [query, metal, sort],
  );
  return (
    <section className="py-16">
      <Container>
        <div className="mb-8 grid gap-4 md:grid-cols-[1fr_220px_220px]">
          <SearchBar
            onSubmit={(e) => e.preventDefault()}
            placeholder="جست‌وجوی محصول..."
            inputProps={{
              value: query,
              onChange: (e) => {
                setLoading(true);
                setQuery(e.target.value);
                window.setTimeout(() => setLoading(false), 200);
              },
            }}
          />
          <Select
            value={metal}
            onChange={(e) => setMetal(e.target.value)}
            aria-label="فیلتر نوع فلز"
          >
            <option value="all">همه فلزها</option>
            <option value="gold">طلا</option>
            <option value="silver">نقره</option>
          </Select>
          <Select value={sort} onChange={(e) => setSort(e.target.value)} aria-label="مرتب‌سازی">
            <option value="default">مرتب‌سازی پیش‌فرض</option>
            <option value="price-asc">قیمت صعودی</option>
            <option value="price-desc">قیمت نزولی</option>
          </Select>
        </div>
        {loading ? (
          <div className="grid gap-6 md:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-80" />
            ))}
          </div>
        ) : results.length ? (
          <div className="products-grid">
            {results.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        ) : (
          <EmptyState title="محصولی پیدا نشد" description="عبارت یا فیلتر دیگری را امتحان کنید." />
        )}
      </Container>
    </section>
  );
}
