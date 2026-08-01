"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import type { Category, ProductListFilters } from "../types/catalog.types";

const SORT_OPTIONS: {
  value: NonNullable<ProductListFilters["sortBy"]>;
  label: string;
}[] = [
  { value: "createdAt", label: "Mới nhất" },
  { value: "soldCount", label: "Bán chạy" },
  { value: "ratingAvg", label: "Đánh giá cao" },
];

interface FilterBarProps {
  categories: Category[];
  selectedCategoryId?: number;
  sortBy: NonNullable<ProductListFilters["sortBy"]>;
}

/**
 * Owns URL navigation directly (category/sort are the source of truth in the
 * query string) so the server-rendered listing page refetches on change —
 * no separate client-side query state to keep in sync.
 */
export function FilterBar({ categories, selectedCategoryId, sortBy }: FilterBarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const pushParam = (key: string, value: string | undefined) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value === undefined) {
      params.delete(key);
    } else {
      params.set(key, value);
    }
    params.delete("page");
    router.push(`${pathname}?${params.toString()}`);
  };

  return (
    <div className="flex flex-col gap-3">
      <div className="flex gap-2 overflow-x-auto pb-1">
        <button
          type="button"
          onClick={() => pushParam("categoryId", undefined)}
          className={[
            "shrink-0 rounded-full border px-3.5 py-1.5 text-xs font-manrope",
            selectedCategoryId === undefined
              ? "border-hub-500 bg-hub-50 text-hub-600"
              : "border-neutral-200 text-neutral-600",
          ].join(" ")}
        >
          Tất cả
        </button>
        {categories.map((category) => (
          <button
            key={category.id}
            type="button"
            onClick={() => pushParam("categoryId", String(category.id))}
            className={[
              "shrink-0 rounded-full border px-3.5 py-1.5 text-xs font-manrope",
              selectedCategoryId === category.id
                ? "border-hub-500 bg-hub-50 text-hub-600"
                : "border-neutral-200 text-neutral-600",
            ].join(" ")}
          >
            {category.name}
          </button>
        ))}
      </div>

      <select
        value={sortBy}
        onChange={(event) => pushParam("sortBy", event.target.value)}
        className="w-fit rounded-lg border border-neutral-200 px-2.5 py-1.5 text-xs font-manrope text-neutral-700"
      >
        {SORT_OPTIONS.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
}
