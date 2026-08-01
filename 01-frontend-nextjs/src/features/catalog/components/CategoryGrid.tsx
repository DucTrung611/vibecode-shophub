import Link from "next/link";
import type { Category } from "../types/catalog.types";

interface CategoryGridProps {
  categories: Category[];
}

export function CategoryGrid({ categories }: CategoryGridProps) {
  const topLevel = categories.slice(0, 8);

  return (
    <div className="grid grid-cols-4 gap-3 md:grid-cols-8">
      {topLevel.map((category) => (
        <Link
          key={category.id}
          href={`/products?categoryId=${category.id}`}
          className="flex flex-col items-center gap-1.5 text-center"
        >
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-hub-50 text-xl font-bold text-hub-600 font-sora">
            {category.name.charAt(0).toUpperCase()}
          </div>
          <span className="line-clamp-1 text-xs font-manrope text-neutral-700">
            {category.name}
          </span>
        </Link>
      ))}
    </div>
  );
}
