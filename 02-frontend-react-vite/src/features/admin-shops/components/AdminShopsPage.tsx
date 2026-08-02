import { useState } from "react";
import { useNavigate } from "react-router";
import { Table, type TableColumn } from "../../../shared/components/Table";
import { Pagination } from "../../../shared/components/Pagination";
import { Tabs, type TabItem } from "../../../shared/components/Tabs";
import { Badge, type BadgeVariant } from "../../../shared/components/Badge";
import { formatDate } from "../../../shared/utils/format";
import { useAdminShops } from "../hooks/useAdminShops";
import type { AdminShop, ShopStatus } from "../types/admin-shops.types";

const STATUS_TABS: TabItem[] = [
  { value: "pending", label: "Chờ duyệt" },
  { value: "approved", label: "Đã duyệt" },
  { value: "suspended", label: "Tạm ngưng" },
  { value: "rejected", label: "Từ chối" },
];

const STATUS_META: Record<ShopStatus, { label: string; variant: BadgeVariant }> = {
  pending: { label: "Chờ duyệt", variant: "warning" },
  approved: { label: "Đã duyệt", variant: "success" },
  suspended: { label: "Tạm ngưng", variant: "neutral" },
  rejected: { label: "Từ chối", variant: "error" },
};

const LIMIT = 10;

export function AdminShopsPage() {
  const navigate = useNavigate();
  const [status, setStatus] = useState<ShopStatus>("pending");
  const [page, setPage] = useState(1);

  const { data, isLoading, isError } = useAdminShops({ page, limit: LIMIT, status });

  const columns: TableColumn<AdminShop>[] = [
    {
      header: "Tên gian hàng",
      accessor: "name",
      render: (row) => (
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[9px] bg-hub-50 text-sm font-bold text-hub-600">
            {row.name.charAt(0).toUpperCase()}
          </div>
          <span className="text-xs font-bold text-neutral-900">{row.name}</span>
        </div>
      ),
    },
    { header: "Owner ID", accessor: "ownerId" },
    {
      header: "Ngày đăng ký",
      accessor: "createdAt",
      render: (row) => formatDate(row.createdAt),
    },
    {
      header: "Trạng thái",
      accessor: "status",
      render: (row) => {
        const meta = STATUS_META[row.status];
        return <Badge variant={meta.variant}>{meta.label}</Badge>;
      },
    },
    {
      header: "Thao tác",
      accessor: "id",
      className: "text-right",
      render: () => <div className="text-right text-xs font-bold text-hub-600">Xem chi tiết</div>,
    },
  ];

  return (
    <div className="flex flex-col gap-4">
      <Tabs
        tabs={STATUS_TABS}
        value={status}
        onChange={(value) => {
          setStatus(value as ShopStatus);
          setPage(1);
        }}
      />

      {isError && (
        <p className="text-sm font-manrope text-error">
          Không thể tải danh sách gian hàng. Vui lòng thử lại.
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
            onRowClick={(row) => navigate(`/admin/shops/${row.id}`)}
          />
          {data?.meta && <Pagination meta={data.meta} onPageChange={setPage} />}
        </>
      )}
    </div>
  );
}
