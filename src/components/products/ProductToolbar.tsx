"use client";

import { useId } from "react";
import { Icon } from "@/components/ui/Icon";

interface ProductToolbarProps {
  query: string;
  onQueryChange: (value: string) => void;
  metal: string;
  onMetalChange: (value: "all" | "gold" | "silver") => void;
  sort: string;
  onSortChange: (value: string) => void;
  sortOptions: readonly { value: string; label: string }[];
}

/** Shared, RTL-aware controls; the native select retains mobile and keyboard support. */
export function ProductToolbar({
  query,
  onQueryChange,
  metal,
  onMetalChange,
  sort,
  onSortChange,
  sortOptions,
}: ProductToolbarProps) {
  const id = useId();

  return (
    <div className="catalog-toolbar" dir="rtl" role="group" aria-label="جست‌وجو و فیلتر محصولات">
      <div className="catalog-field catalog-search-field">
        <label htmlFor={`${id}-search`}>جست‌وجوی محصول</label>
        <div className="catalog-search-control">
          <Icon name="search" />
          <input
            id={`${id}-search`}
            type="search"
            placeholder="نام یا وزن شمش را بنویسید…"
            value={query}
            onChange={(event) => onQueryChange(event.target.value)}
            autoComplete="off"
          />
          {query && (
            <button
              className="catalog-clear"
              type="button"
              aria-label="پاک‌کردن جست‌وجو"
              onClick={() => onQueryChange("")}
            >
              <Icon name="x" size={16} />
            </button>
          )}
        </div>
      </div>

      <div className="catalog-field">
        <span id={`${id}-metal`}>نوع فلز</span>
        <div className="catalog-metal-filter" role="group" aria-labelledby={`${id}-metal`}>
          {(
            [
              { value: "all", label: "همه" },
              { value: "gold", label: "طلا" },
              { value: "silver", label: "نقره" },
            ] as const
          ).map((item) => (
            <button
              type="button"
              key={item.value}
              aria-pressed={metal === item.value}
              onClick={() => onMetalChange(item.value)}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      <div className="catalog-field">
        <label htmlFor={`${id}-sort`}>مرتب‌سازی</label>
        <div className="catalog-select-control">
          <select
            id={`${id}-sort`}
            value={sort}
            onChange={(event) => onSortChange(event.target.value)}
          >
            {sortOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <Icon name="chevron-down" size={16} />
        </div>
      </div>
    </div>
  );
}
