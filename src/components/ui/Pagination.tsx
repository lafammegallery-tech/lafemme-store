import { IconButton } from "./IconButton";
export interface PaginationProps {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}
/** Compact pagination with labelled previous/next controls and current-page state. */
export function Pagination({ page, totalPages, onPageChange }: PaginationProps) {
  const pages = Array.from({ length: totalPages }, (_, index) => index + 1);
  return (
    <nav aria-label="صفحه‌بندی" className="flex items-center justify-center gap-2">
      <IconButton
        label="صفحه قبل"
        icon={<span aria-hidden="true">‹</span>}
        disabled={page <= 1}
        onClick={() => onPageChange(page - 1)}
      />
      {pages.map((value) => (
        <button
          key={value}
          type="button"
          aria-current={value === page ? "page" : undefined}
          onClick={() => onPageChange(value)}
          className={`h-10 min-w-10 rounded-full px-3 text-sm outline-none focus-visible:shadow-lf-focus ${value === page ? "bg-lf-gold text-lf-black" : "bg-lf-surface text-lf-white hover:text-lf-gold"}`}
        >
          {value}
        </button>
      ))}
      <IconButton
        label="صفحه بعد"
        icon={<span aria-hidden="true">›</span>}
        disabled={page >= totalPages}
        onClick={() => onPageChange(page + 1)}
      />
    </nav>
  );
}
