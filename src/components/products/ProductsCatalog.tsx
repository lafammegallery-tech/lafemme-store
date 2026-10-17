"use client";

import { useMemo, useState } from "react";
import type { Product, ProductType } from "@/types/product";
import { ProductGrid } from "./ProductGrid";
import { ProductToolbar } from "./ProductToolbar";

type FilterValue = "all" | ProductType;
type SortValue = "default" | "newest" | "price-low" | "price-high" | "weight-low" | "weight-high";

/**
 * رابط جست‌وجو، فیلتر و مرتب‌سازی محصولات.
 * فیلتر و مرتب‌سازی روی محصولات دریافتی از سرور انجام می‌شود.
 */
export function ProductsCatalog({ items }: { items: Product[] }) {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<FilterValue>("all");
  const [sort, setSort] = useState<SortValue>("default");

  const visibleProducts = useMemo(() => {
    const normalizedSearch = search.trim().toLocaleLowerCase("fa");

    const result = items.filter((product) => {
      const matchesSearch =
        normalizedSearch.length === 0 ||
        product.name.toLocaleLowerCase("fa").includes(normalizedSearch) ||
        product.weight.includes(normalizedSearch);

      const matchesFilter = filter === "all" || product.type === filter;
      return matchesSearch && matchesFilter;
    });

    return [...result].sort((first, second) => {
      if (sort === "newest")
        return (
          Date.parse(second.createdAt ?? "1970-01-01") - Date.parse(first.createdAt ?? "1970-01-01")
        );
      if (sort === "price-low") return first.price - second.price;
      if (sort === "price-high") return second.price - first.price;
      if (sort === "weight-low") return first.weightValue - second.weightValue;
      if (sort === "weight-high") return second.weightValue - first.weightValue;
      return 0;
    });
  }, [filter, items, search, sort]);

  return (
    <>
      <section className="products-toolbar" aria-label="ابزارهای فهرست محصولات">
        <div className="container">
          <ProductToolbar
            query={search}
            onQueryChange={setSearch}
            metal={filter}
            onMetalChange={setFilter}
            sort={sort}
            onSortChange={(value) => setSort(value as SortValue)}
            sortOptions={[
              { value: "default", label: "پیش‌فرض" },
              { value: "newest", label: "جدیدترین" },
              { value: "price-low", label: "کمترین قیمت" },
              { value: "price-high", label: "بیشترین قیمت" },
              { value: "weight-low", label: "وزن کمتر" },
              { value: "weight-high", label: "وزن بیشتر" },
            ]}
          />
        </div>
      </section>

      <section className="products-section" aria-labelledby="products-list-title">
        <div className="container">
          <h2 className="sr-only" id="products-list-title">
            فهرست محصولات
          </h2>

          {visibleProducts.length > 0 ? (
            <ProductGrid items={visibleProducts} />
          ) : (
            <div className="empty-products product-empty-visible" role="status">
              <h2>محصولی پیدا نشد</h2>
              <p>لطفاً عبارت دیگری جستجو کنید.</p>
            </div>
          )}
        </div>
      </section>

      <section className="products-info" aria-live="polite">
        <div className="container">
          <div className="products-info-wrapper">
            <p>
              تعداد محصولات: <strong>{visibleProducts.length.toLocaleString("fa-IR")}</strong>
            </p>
          </div>
        </div>
      </section>
    </>
  );
}
