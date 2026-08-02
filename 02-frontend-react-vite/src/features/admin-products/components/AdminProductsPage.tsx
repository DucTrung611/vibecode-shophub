import { useState } from "react";
import { Table, type TableColumn } from "../../../shared/components/Table";
import { Pagination } from "../../../shared/components/Pagination";
import { Badge } from "../../../shared/components/Badge";
import { getAssetUrl } from "../../../shared/utils/asset-url";
import { useFlaggedProducts } from "../hooks/useFlaggedProducts";
import { ProductReviewModal } from "./ProductReviewModal";
import type { FlaggedProduct } from "../types/admin-products.types";

const LIMIT = 10;

export function AdminProductsPage() {
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<FlaggedProduct | null>(null);

  const { data, isLoading, isError } = useFlaggedProducts({ page, limit: LIMIT });

  const columns: TableColumn<FlaggedProduct>[] = [
    {
      header: "Sản phẩm",
      accessor: "name",
      render: (row) => (
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-[9px] bg-error-tint">
            {row.images[0] ? (
              <img
                src={getAssetUrl(row.images[0].url)}
                alt={row.name}
                className="h-full w-full object-cover"
              />
            ) : (
              <span>📦</span>
            )}
          </div>
          <span className="text-xs font-bold text-neutral-900">{row.name}</span>
        </div>
      ),
    },
    { header: "Shop ID", accessor: "shopId" },
    {
      header: "Lý do gắn cờ",
      accessor: "flagReason",
      render: (row) => (
        <span className="font-semibold text-error">{row.flagReason ?? "—"}</span>
      ),
    },
    {
      header: "Trạng thái",
      accessor: "status",
      render: () => <Badge variant="warning">Chờ duyệt</Badge>,
    },
    {
      header: "Thao tác",
      accessor: "id",
      className: "text-right",
      render: () => <div className="text-right text-xs font-bold text-hub-600">Xem xét</div>,
    },
  ];

  return (
    <div className="flex flex-col gap-4">
      {isError && (
        <p className="text-sm font-manrope text-error">
          Không thể tải danh sách sản phẩm chờ kiểm duyệt. Vui lòng thử lại.
        </p>
      )}

      {isLoading ? (
        <p className="text-sm font-manrope text-neutral-500">Đang tải...</p>
      ) : (
        <>
          <Table
            columns={columns}
            rows={data?.items ?? []}
            rowKey={(row) => row.id}
            onRowClick={setSelected}
          />
          {data?.meta && <Pagination meta={data.meta} onPageChange={setPage} />}
        </>
      )}

      <ProductReviewModal product={selected} onClose={() => setSelected(null)} />
    </div>
  );
}
