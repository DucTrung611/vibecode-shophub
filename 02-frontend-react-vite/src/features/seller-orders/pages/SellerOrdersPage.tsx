import { useState } from "react";
import { useNavigate } from "react-router";
import { Badge } from "../../../shared/components/Badge";
import { Pagination } from "../../../shared/components/Pagination";
import { Table, type TableColumn } from "../../../shared/components/Table";
import { Tabs } from "../../../shared/components/Tabs";
import { formatCurrency, formatDate } from "../../../shared/utils/format";
import { useSellerOrders } from "../hooks/useSellerOrders";
import type { OrderListItem, OrderStatus } from "../types/order.types";
import { orderStatusLabel, orderStatusVariant } from "../utils/order-status.util";

const TABS: { value: OrderStatus | "all"; label: string }[] = [
  { value: "all", label: "Tất cả" },
  { value: "pending", label: "Chờ xác nhận" },
  { value: "confirmed", label: "Đã xác nhận" },
  { value: "shipped", label: "Đang giao" },
  { value: "delivered", label: "Đã giao" },
  { value: "cancelled", label: "Đã hủy" },
];

export function SellerOrdersPage() {
  const navigate = useNavigate();
  const [status, setStatus] = useState<OrderStatus | "all">("all");
  const [page, setPage] = useState(1);
  const { data, isLoading, isError } = useSellerOrders({ status, page, limit: 20 });

  const columns: TableColumn<OrderListItem>[] = [
    { header: "Mã đơn", accessor: "orderCode" },
    {
      header: "Trạng thái",
      accessor: "status",
      render: (row) => (
        <Badge variant={orderStatusVariant(row.status)}>{orderStatusLabel(row.status)}</Badge>
      ),
    },
    {
      header: "Tổng tiền",
      accessor: "totalAmount",
      render: (row) => formatCurrency(row.totalAmount),
    },
    {
      header: "Ngày đặt",
      accessor: "createdAt",
      render: (row) => formatDate(row.createdAt),
    },
  ];

  return (
    <div className="flex flex-col gap-5">
      <Tabs
        tabs={TABS}
        value={status}
        onChange={(value) => {
          setStatus(value as OrderStatus | "all");
          setPage(1);
        }}
      />

      {isError && (
        <p className="text-sm font-manrope text-error">Không thể tải danh sách đơn hàng.</p>
      )}

      {isLoading ? (
        <p className="text-sm font-manrope text-neutral-500">Đang tải...</p>
      ) : (
        <>
          <Table
            columns={columns}
            rows={data?.orders ?? []}
            rowKey={(row) => row.id}
            onRowClick={(row) => navigate(`/seller/orders/${row.id}`)}
          />
          {data && <Pagination meta={data.meta} onPageChange={setPage} />}
        </>
      )}
    </div>
  );
}
