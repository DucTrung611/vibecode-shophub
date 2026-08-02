"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { type FormEvent, Suspense, useMemo, useState } from "react";
import { ProductGrid, useCategories, useProducts } from "@/features/catalog";

const RECENT_SEARCHES_KEY = "shophub-recent-searches";

function loadRecentSearches(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(RECENT_SEARCHES_KEY);
    return raw ? (JSON.parse(raw) as string[]) : [];
  } catch {
    return [];
  }
}

function saveRecentSearch(term: string) {
  const current = loadRecentSearches().filter((item) => item !== term);
  window.localStorage.setItem(
    RECENT_SEARCHES_KEY,
    JSON.stringify([term, ...current].slice(0, 5)),
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={null}>
      <SearchPageWithParams />
    </Suspense>
  );
}

function SearchPageWithParams() {
  const searchParams = useSearchParams();
  const query = searchParams.get("q") ?? "";
  // Remount on query change instead of syncing local state via an effect —
  // each search term gets a fresh input value and recent-searches read.
  return <SearchPageContent key={query} query={query} />;
}

function SearchPageContent({ query }: { query: string }) {
  const router = useRouter();
  const [inputValue, setInputValue] = useState(query);
  const recentSearches = useMemo(() => {
    if (query) saveRecentSearch(query);
    return loadRecentSearches();
  }, [query]);

  const { data: categories } = useCategories();
  // The catalog API doesn't expose full-text search yet — this filters a
  // broad product fetch client-side, which is fine at seed-data scale but
  // is a documented simplification, not a real search backend.
  const {
    data: productsResult,
    isLoading,
    isError,
    refetch,
  } = useProducts({
    limit: 100,
    sortBy: "soldCount",
    order: "desc",
  });

  const filteredProducts = useMemo(() => {
    if (!productsResult || !query) return [];
    const lower = query.toLowerCase();
    return productsResult.items.filter((product) =>
      product.name.toLowerCase().includes(lower),
    );
  }, [productsResult, query]);

  const trendingProducts = productsResult?.items.slice(0, 6) ?? [];

  const handleSearchSubmit = (event: FormEvent) => {
    event.preventDefault();
    router.push(inputValue ? `/search?q=${encodeURIComponent(inputValue)}` : "/search");
  };

  return (
    <div className="mx-auto flex max-w-[1200px] flex-col gap-6 px-4 py-6 md:px-6">
      <form onSubmit={handleSearchSubmit} className="flex gap-2">
        <input
          name="q"
          value={inputValue}
          onChange={(event) => setInputValue(event.target.value)}
          placeholder="Tìm kiếm sản phẩm..."
          className="flex-1 rounded-full border border-neutral-200 px-4 py-2 text-sm font-manrope outline-none focus:border-hub-500 focus:ring-3 focus:ring-hub-100"
        />
        <button
          type="submit"
          className="rounded-full bg-hub-500 px-5 text-sm font-bold font-manrope text-white"
        >
          Tìm
        </button>
      </form>

      {!query ? (
        <div className="flex flex-col gap-6">
          {recentSearches.length > 0 && (
            <section>
              <h2 className="mb-2 text-sm font-bold font-sora text-neutral-900">
                Tìm kiếm gần đây
              </h2>
              <div className="flex flex-wrap gap-2">
                {recentSearches.map((term) => (
                  <Link
                    key={term}
                    href={`/search?q=${encodeURIComponent(term)}`}
                    className="rounded-full border border-neutral-200 px-3 py-1.5 text-xs font-manrope text-neutral-600"
                  >
                    {term}
                  </Link>
                ))}
              </div>
            </section>
          )}

          <section>
            <h2 className="mb-2 text-sm font-bold font-sora text-neutral-900">
              Danh mục nổi bật
            </h2>
            <div className="flex flex-wrap gap-2">
              {(categories ?? []).map((category) => (
                <Link
                  key={category.id}
                  href={`/products?categoryId=${category.id}`}
                  className="rounded-full border border-neutral-200 px-3 py-1.5 text-xs font-manrope text-neutral-600"
                >
                  {category.name}
                </Link>
              ))}
            </div>
          </section>

          <section>
            <h2 className="mb-2 text-sm font-bold font-sora text-neutral-900">
              Sản phẩm thịnh hành
            </h2>
            <ProductGrid products={trendingProducts} />
          </section>
        </div>
      ) : isLoading ? (
        <p className="py-10 text-center text-sm font-manrope text-neutral-500">
          Đang tìm kiếm...
        </p>
      ) : isError ? (
        <div className="flex flex-col items-center gap-3 py-16 text-center">
          <span className="text-4xl">⚠️</span>
          <p className="font-manrope text-neutral-500">Không thể tìm kiếm sản phẩm lúc này</p>
          <button
            type="button"
            onClick={() => refetch()}
            className="rounded-lg bg-hub-500 px-5 py-2 text-sm font-bold font-manrope text-white"
          >
            Thử lại
          </button>
        </div>
      ) : filteredProducts.length === 0 ? (
        <div className="flex flex-col items-center gap-3 py-16 text-center">
          <span className="text-4xl">🔍</span>
          <p className="font-manrope text-neutral-500">
            Không tìm thấy kết quả cho &quot;{query}&quot;
          </p>
          <Link href="/products" className="text-sm font-bold text-hub-600">
            Xem tất cả sản phẩm
          </Link>
        </div>
      ) : (
        <>
          <p className="text-sm font-manrope text-neutral-500">
            {filteredProducts.length} kết quả cho &quot;{query}&quot;
          </p>
          <ProductGrid products={filteredProducts} />
        </>
      )}
    </div>
  );
}
