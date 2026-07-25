import Link from "next/link";
export interface BreadcrumbItem {
  label: string;
  href?: string;
}
/** Breadcrumb navigation with current-page semantics. */
export function Breadcrumb({ items }: { items: BreadcrumbItem[] }) {
  return (
    <nav aria-label="مسیر صفحه">
      <ol className="flex flex-wrap items-center gap-2 text-sm text-lf-gray">
        {items.map((item, index) => (
          <li key={`${item.label}-${index}`} className="flex items-center gap-2">
            {index > 0 && <span aria-hidden="true">/</span>}
            {item.href && index < items.length - 1 ? (
              <Link
                className="hover:text-lf-gold focus-visible:outline-none focus-visible:shadow-lf-focus"
                href={item.href}
              >
                {item.label}
              </Link>
            ) : (
              <span
                aria-current={index === items.length - 1 ? "page" : undefined}
                className={index === items.length - 1 ? "text-lf-white" : undefined}
              >
                {item.label}
              </span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}
