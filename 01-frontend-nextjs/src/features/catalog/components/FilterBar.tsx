"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
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
  minPrice?: number;
  maxPrice?: number;
  view: "grid" | "list";
}

/**
 * Owns URL navigation directly (category/sort/price/view are the source of truth
 * in the query string) so the server-rendered listing page refetches on change —
 * no separate client-side query state to keep in sync.
 */
export function FilterBar({
  categories,
  selectedCategoryId,
  sortBy,
  minPrice,
  maxPrice,
  view,
}: FilterBarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [minInput, setMinInput] = useState(minPrice?.toString() ?? "");
  const [maxInput, setMaxInput] = useState(maxPrice?.toString() ?? "");

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

  const applyPriceRange = () => {
    const params = new URLSearchParams(searchParams.toString());
    if (minInput) params.set("minPrice", minInput);
    else params.delete("minPrice");
    if (maxInput) params.set("maxPrice", maxInput);
    else params.delete("maxPrice");
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

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <input
            type="number"
            min={0}
            placeholder="Giá từ"
            value={minInput}
            onChange={(event) => setMinInput(event.target.value)}
            onBlur={applyPriceRange}
            className="w-24 rounded-lg border border-neutral-200 px-2.5 py-1.5 text-xs font-manrope text-neutral-700"
          />
          <span className="text-xs text-neutral-400">—</span>
          <input
            type="number"
            min={0}
            placeholder="Giá đến"
            value={maxInput}
            onChange={(event) => setMaxInput(event.target.value)}
            onBlur={applyPriceRange}
            className="w-24 rounded-lg border border-neutral-200 px-2.5 py-1.5 text-xs font-manrope text-neutral-700"
          />

          <select
            value={sortBy}
            onChange={(event) => pushParam("sortBy", event.target.value)}
            className="rounded-lg border border-neutral-200 px-2.5 py-1.5 text-xs font-manrope text-neutral-700"
          >
            {SORT_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-1 rounded-lg border border-neutral-200 p-0.5">
          <button
            type="button"
            aria-label="Xem dạng lưới"
            onClick={() => pushParam("view", undefined)}
            className={[
              "flex h-7 w-7 items-center justify-center rounded-md text-sm",
              view === "grid" ? "bg-hub-50 text-hub-600" : "text-neutral-400",
            ].join(" ")}
          >
            ▦
          </button>
          <button
            type="button"
            aria-label="Xem dạng danh sách"
            onClick={() => pushParam("view", "list")}
            className={[
              "flex h-7 w-7 items-center justify-center rounded-md text-sm",
              view === "list" ? "bg-hub-50 text-hub-600" : "text-neutral-400",
            ].join(" ")}
          >
            ☰
          </button>
        </div>
      </div>
    </div>
  );
}
