"use client";
import { useMemo, useState } from "react";
import { Container, EmptyState } from "@/components/ui";
import { ProductCard } from "@/components/products";
import { ProductToolbar } from "@/components/products/ProductToolbar";
import type { Product } from "@/types/product";

/** Client-side search and filtering of the current storefront products. */
export function SearchExperience({ products }: { products: Product[] }) {
  const [query, setQuery] = useState("");
  const [metal, setMetal] = useState("all");
  const [sort, setSort] = useState("default");
  const results = useMemo(
    () =>
      products
        .filter((p) => p.name.includes(query) && (metal === "all" || p.type === metal))
        .sort((a, b) =>
          sort === "price-asc" ? a.price - b.price : sort === "price-desc" ? b.price - a.price : 0,
        ),
    [query, metal, sort, products],
  );
  return (
    <section className="catalog-search-section">
      <Container>
        <ProductToolbar
          query={query}
          onQueryChange={setQuery}
          metal={metal}
          onMetalChange={setMetal}
          sort={sort}
          onSortChange={setSort}
          sortOptions={[
            { value: "default", label: "پیش‌فرض" },
            { value: "price-asc", label: "کمترین قیمت" },
            { value: "price-desc", label: "بیشترین قیمت" },
          ]}
        />
        <p className="catalog-results-count" role="status">
          {results.length.toLocaleString("fa-IR")} محصول پیدا شد
        </p>
        {results.length ? (
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
