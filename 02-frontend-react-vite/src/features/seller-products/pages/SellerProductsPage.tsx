import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router";
import { Plus, SquarePen, Trash2 } from "lucide-react";
import { useMyShop } from "../../seller-settings";
import { Badge } from "../../../shared/components/Badge";
import { Button } from "../../../shared/components/Button";
import { Input } from "../../../shared/components/Input";
import { Pagination } from "../../../shared/components/Pagination";
import { Table, type TableColumn } from "../../../shared/components/Table";
import { useCategories } from "../hooks/useCategories";
import { useDeactivateProduct } from "../hooks/useProductMutations";
import { useShopProducts } from "../hooks/useShopProducts";
import type { ProductListItem, ProductStatus } from "../types/product.types";
import { productStatusLabel, productStatusVariant } from "../utils/product-status.util";

const STATUS_OPTIONS: { value: ProductStatus | "all"; label: string }[] = [
  { value: "all", label: "Tất cả trạng thái" },
  { value: "draft", label: "Nháp" },
  { value: "active", label: "Đang bán" },
  { value: "inactive", label: "Đã ẩn" },
  { value: "flagged", label: "Chờ kiểm duyệt" },
];

export function SellerProductsPage() {
  const navigate = useNavigate();
  const { data: shop } = useMyShop();
  const { data: categories } = useCategories();
  const [search, setSearch] = useState("");
  const [categoryId, setCategoryId] = useState<number | undefined>(undefined);
  const [status, setStatus] = useState<ProductStatus | "all">("all");
  const [page, setPage] = useState(1);
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());

  const { data, isLoading, isError } = useShopProducts(
    shop ? { shopId: shop.id, categoryId, status, page, limit: 20 } : null,
  );

  // The public catalog list endpoint has no text-search query param (full-text
  // search is served by Meilisearch in production, not this API) — filter the
  // current page's results client-side as a lightweight approximation.
  const visibleProducts = useMemo(() => {
    if (!data) return [];
    if (!search.trim()) return data.products;
    const term = search.trim().toLowerCase();
    return data.products.filter((product) => product.name.toLowerCase().includes(term));
  }, [data, search]);

  const deactivateProduct = useDeactivateProduct();

  function toggleSelected(id: number) {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function toggleSelectAll() {
    setSelectedIds((prev) =>
      prev.size === visibleProducts.length ? new Set() : new Set(visibleProducts.map((p) => p.id)),
    );
  }

  async function handleBulkDeactivate() {
    if (selectedIds.size === 0) return;
    if (!window.confirm(`Ẩn ${selectedIds.size} sản phẩm đã chọn?`)) return;
    for (const id of selectedIds) {
      await deactivateProduct.mutateAsync(id);
    }
    setSelectedIds(new Set());
  }

  useEffect(() => {
    setSelectedIds(new Set());
  }, [data]);

  const columns: TableColumn<ProductListItem>[] = [
    {
      header: (
        <input
          type="checkbox"
          aria-label="Chọn tất cả sản phẩm"
          checked={visibleProducts.length > 0 && selectedIds.size === visibleProducts.length}
          onChange={toggleSelectAll}
        />
      ),
      accessor: "__select__",
      render: (row) => (
        <input
          type="checkbox"
          aria-label={`Chọn sản phẩm ${row.name}`}
          checked={selectedIds.has(row.id)}
          onClick={(event) => event.stopPropagation()}
          onChange={() => toggleSelected(row.id)}
        />
      ),
    },
    { header: "Tên sản phẩm", accessor: "name" },
    {
      header: "Danh mục",
      accessor: "categoryId",
      render: (row) =>
        categories?.flatMap((c) => [c, ...(c.children ?? [])]).find((c) => c.id === row.categoryId)
          ?.name ?? "—",
    },
    { header: "Đã bán", accessor: "soldCount" },
    {
      header: "Trạng thái",
      accessor: "status",
      render: (row) => (
        <Badge variant={productStatusVariant(row.status)}>{productStatusLabel(row.status)}</Badge>
      ),
    },
    {
      header: "Thao tác",
      accessor: "id",
      render: (row) => (
        <div className="flex items-center gap-2">
          <button
            type="button"
            aria-label="Sửa sản phẩm"
            onClick={(event) => {
              event.stopPropagation();
              navigate(`/seller/products/${row.slug}/edit`);
            }}
            className="rounded-lg p-1.5 text-neutral-500 hover:bg-neutral-100 hover:text-hub-600"
          >
            <SquarePen size={15} />
          </button>
          <button
            type="button"
            aria-label="Ẩn sản phẩm"
            onClick={(event) => {
              event.stopPropagation();
              if (window.confirm(`Ẩn sản phẩm "${row.name}"?`)) {
                deactivateProduct.mutate(row.id);
              }
            }}
            className="rounded-lg p-1.5 text-neutral-500 hover:bg-error-tint hover:text-error"
          >
            <Trash2 size={15} />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-1 flex-wrap items-center gap-3">
          <Input
            placeholder="Tìm sản phẩm theo tên..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            className="max-w-xs"
          />
          <select
            value={categoryId ?? ""}
            onChange={(event) => {
              setCategoryId(event.target.value ? Number(event.target.value) : undefined);
              setPage(1);
            }}
            className="rounded-[9px] border border-neutral-200 px-3.5 py-3 text-sm font-manrope text-neutral-900 outline-none focus:border-hub-500"
          >
            <option value="">Tất cả danh mục</option>
            {categories?.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
          <select
            value={status}
            onChange={(event) => {
              setStatus(event.target.value as ProductStatus | "all");
              setPage(1);
            }}
            className="rounded-[9px] border border-neutral-200 px-3.5 py-3 text-sm font-manrope text-neutral-900 outline-none focus:border-hub-500"
          >
            {STATUS_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
        <div className="w-fit">
          <Button type="button" onClick={() => navigate("/seller/products/new")}>
            <span className="flex items-center gap-1.5">
              <Plus size={15} />
              Thêm sản phẩm
            </span>
          </Button>
        </div>
      </div>

      {isError && (
        <p className="text-sm font-manrope text-error">Không thể tải danh sách sản phẩm.</p>
      )}

      {selectedIds.size > 0 && (
        <div className="flex items-center justify-between rounded-2xl border border-hub-200 bg-hub-50 px-4 py-3">
          <span className="text-sm font-bold font-manrope text-hub-700">
            Đã chọn {selectedIds.size} sản phẩm
          </span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setSelectedIds(new Set())}
              className="text-sm font-manrope text-neutral-600 hover:underline"
            >
              Bỏ chọn
            </button>
            <div className="w-fit">
              <Button type="button" variant="danger" onClick={handleBulkDeactivate}>
                Ẩn sản phẩm đã chọn
              </Button>
            </div>
          </div>
        </div>
      )}

      {isLoading ? (
        <p className="text-sm font-manrope text-neutral-500">Đang tải...</p>
      ) : (
        <>
          <Table
            columns={columns}
            rows={visibleProducts}
            rowKey={(row) => row.id}
            onRowClick={(row) => navigate(`/seller/products/${row.slug}/edit`)}
          />
          {data && <Pagination meta={data.meta} onPageChange={setPage} />}
        </>
      )}
    </div>
  );
}
