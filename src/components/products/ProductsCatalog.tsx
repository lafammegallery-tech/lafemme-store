"use client";

import { useMemo, useState } from "react";
import type { Product, ProductType } from "@/types/product";
import { ProductGrid } from "./ProductGrid";

type FilterValue = "all" | ProductType;
type SortValue = "default" | "newest" | "price-low" | "price-high" | "weight-low" | "weight-high";

/**
 * رابط جست‌وجو، فیلتر و مرتب‌سازی محصولات.
 * این منطق فقط روی داده Mock کار می‌کند و هیچ ارتباطی با Backend ندارد.
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
      if (sort === "newest") return Number(second.id) - Number(first.id);
      if (sort === "price-low") return first.price - second.price;
      if (sort === "price-high") return second.price - first.price;
      if (sort === "weight-low") return first.weightValue - second.weightValue;
      if (sort === "weight-high") return second.weightValue - first.weightValue;
      return Number(first.id) - Number(second.id);
    });
  }, [filter, items, search, sort]);

  return (
    <>
      <section className="products-toolbar" aria-label="ابزارهای فهرست محصولات">
        <div className="container">
          <div className="toolbar-wrapper">
            <div className="search-box">
              <label className="sr-only" htmlFor="searchInput">
                جست‌وجوی محصول
              </label>
              <input
                type="search"
                id="searchInput"
                placeholder="جستجوی محصول ..."
                value={search}
                onChange={(event) => setSearch(event.target.value)}
              />
            </div>

            <div className="products-filter" aria-label="فیلتر نوع محصول">
              {[
                { value: "all", label: "همه" },
                { value: "gold", label: "طلا" },
                { value: "silver", label: "نقره" },
              ].map((item) => (
                <button
                  key={item.value}
                  type="button"
                  className={`filter-btn ${filter === item.value ? "active" : ""}`}
                  aria-pressed={filter === item.value}
                  onClick={() => setFilter(item.value as FilterValue)}
                >
                  {item.label}
                </button>
              ))}
            </div>

            <div className="sort-box">
              <label className="sr-only" htmlFor="sortProducts">
                مرتب‌سازی محصولات
              </label>
              <select
                id="sortProducts"
                value={sort}
                onChange={(event) => setSort(event.target.value as SortValue)}
              >
                <option value="default">مرتب سازی</option>
                <option value="newest">جدیدترین</option>
                <option value="price-low">کمترین قیمت</option>
                <option value="price-high">بیشترین قیمت</option>
                <option value="weight-low">وزن کمتر</option>
                <option value="weight-high">وزن بیشتر</option>
              </select>
            </div>
          </div>
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
