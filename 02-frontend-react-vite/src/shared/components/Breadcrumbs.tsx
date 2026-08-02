import { Link } from "react-router";

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
}

export function Breadcrumbs({ items }: BreadcrumbsProps) {
  return (
    <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 font-manrope text-sm">
      {items.map((item, index) => {
        const isLast = index === items.length - 1;
        return (
          <span key={`${item.label}-${index}`} className="flex items-center gap-1.5">
            {item.href && !isLast ? (
              <Link to={item.href} className="text-neutral-500 hover:text-hub-600">
                {item.label}
              </Link>
            ) : (
              <span className={isLast ? "font-bold text-neutral-900" : "text-neutral-500"}>
                {item.label}
              </span>
            )}
            {!isLast && <span className="text-neutral-300">/</span>}
          </span>
        );
      })}
    </nav>
  );
}
