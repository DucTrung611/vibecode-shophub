import Link from "next/link";
import { FilterBar, ProductGrid, catalogService } from "@/features/catalog";
import type { ProductListFilters } from "@/features/catalog";

interface ProductsPageProps {
  searchParams: Promise<{
    categoryId?: string;
    sortBy?: string;
    order?: string;
    page?: string;
    minPrice?: string;
    maxPrice?: string;
    view?: string;
  }>;
}

const VALID_SORT_BY: NonNullable<ProductListFilters["sortBy"]>[] = [
  "createdAt",
  "soldCount",
  "ratingAvg",
];

export default async function ProductsPage({ searchParams }: ProductsPageProps) {
  const params = await searchParams;
  const categoryId = params.categoryId ? Number(params.categoryId) : undefined;
  const sortBy = VALID_SORT_BY.includes(params.sortBy as never)
    ? (params.sortBy as NonNullable<ProductListFilters["sortBy"]>)
    : "createdAt";
  const order = params.order === "asc" ? "asc" : "desc";
  const page = Number(params.page) > 0 ? Number(params.page) : 1;
  const limit = 20;
  const minPrice = params.minPrice ? Number(params.minPrice) : undefined;
  const maxPrice = params.maxPrice ? Number(params.maxPrice) : undefined;
  const view = params.view === "list" ? "list" : "grid";

  const [categories, result] = await Promise.all([
    catalogService.getCategories(),
    catalogService.getProducts({
      categoryId,
      sortBy,
      order,
      page,
      limit,
      minPrice,
      maxPrice,
    }),
  ]);

  const totalPages = Math.max(1, Math.ceil(result.total / limit));

  const flatCategories = flattenCategories(categories);

  return (
    <div className="mx-auto flex max-w-[1200px] flex-col gap-4 px-4 py-6 md:px-6">
      <h1 className="text-xl font-bold font-sora text-neutral-900">
        Tất cả sản phẩm
      </h1>

      <FilterBar
        categories={flatCategories}
        selectedCategoryId={categoryId}
        sortBy={sortBy}
        minPrice={minPrice}
        maxPrice={maxPrice}
        view={view}
      />

      {result.items.length === 0 ? (
        <div className="flex flex-col items-center gap-2 py-16 text-center">
          <span className="text-4xl">🔍</span>
          <p className="font-manrope text-neutral-500">
            Không tìm thấy sản phẩm phù hợp
          </p>
        </div>
      ) : (
        <>
          <ProductGrid products={result.items} view={view} />

          {totalPages > 1 && (
            <nav className="mt-4 flex items-center justify-center gap-2">
              {Array.from({ length: totalPages }, (_, index) => index + 1).map(
                (pageNumber) => (
                  <Link
                    key={pageNumber}
                    href={buildPageHref({
                      categoryId,
                      sortBy,
                      order,
                      page: pageNumber,
                      minPrice,
                      maxPrice,
                      view,
                    })}
                    className={[
                      "flex h-8 w-8 items-center justify-center rounded-lg text-sm font-manrope",
                      pageNumber === page
                        ? "bg-hub-500 text-white"
                        : "text-neutral-600 hover:bg-neutral-50",
                    ].join(" ")}
                  >
                    {pageNumber}
                  </Link>
                ),
              )}
            </nav>
          )}
        </>
      )}
    </div>
  );
}

function flattenCategories(
  categories: Awaited<ReturnType<typeof catalogService.getCategories>>,
): Awaited<ReturnType<typeof catalogService.getCategories>> {
  return categories.flatMap((category) => [
    category,
    ...flattenCategories(category.children),
  ]);
}

function buildPageHref(filters: {
  categoryId?: number;
  sortBy: string;
  order: string;
  page: number;
  minPrice?: number;
  maxPrice?: number;
  view: string;
}): string {
  const params = new URLSearchParams();
  if (filters.categoryId !== undefined) {
    params.set("categoryId", String(filters.categoryId));
  }
  params.set("sortBy", filters.sortBy);
  params.set("order", filters.order);
  params.set("page", String(filters.page));
  if (filters.minPrice !== undefined) {
    params.set("minPrice", String(filters.minPrice));
  }
  if (filters.maxPrice !== undefined) {
    params.set("maxPrice", String(filters.maxPrice));
  }
  if (filters.view !== "grid") {
    params.set("view", filters.view);
  }
  return `/products?${params.toString()}`;
}
