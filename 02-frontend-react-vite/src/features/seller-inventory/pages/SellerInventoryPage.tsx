import { useState } from "react";
import { AlertTriangle, Boxes, PackageX, TriangleAlert } from "lucide-react";
import { Badge, type BadgeVariant } from "../../../shared/components/Badge";
import { StatCard } from "../../../shared/components/StatCard";
import { Table, type TableColumn } from "../../../shared/components/Table";
import { Tabs } from "../../../shared/components/Tabs";
import { formatAttributeLabel } from "../../../shared/utils/variant-attribute-label";
import { useInventorySummary } from "../hooks/useInventorySummary";
import type { InventoryItem, InventoryStatusFilter, StockStatus } from "../types/inventory.types";

const STATUS_LABEL: Record<StockStatus, string> = {
  in_stock: "Còn hàng",
  low_stock: "Sắp hết",
  out_of_stock: "Hết hàng",
};

const STATUS_VARIANT: Record<StockStatus, BadgeVariant> = {
  in_stock: "success",
  low_stock: "warning",
  out_of_stock: "error",
};

const TABS: { value: InventoryStatusFilter; label: string }[] = [
  { value: "all", label: "Tất cả" },
  { value: "in_stock", label: "Còn hàng" },
  { value: "low_stock", label: "Sắp hết" },
  { value: "out_of_stock", label: "Hết hàng" },
];

export function SellerInventoryPage() {
  const [status, setStatus] = useState<InventoryStatusFilter>("all");
  const { data, isLoading, isError } = useInventorySummary(status);

  const columns: TableColumn<InventoryItem>[] = [
    { header: "SKU", accessor: "sku" },
    { header: "Sản phẩm", accessor: "productName" },
    {
      header: "Thuộc tính",
      accessor: "attributes",
      render: (row) =>
        Object.entries(row.attributes ?? {})
          .map(([key, value]) => `${formatAttributeLabel(key)}: ${value}`)
          .join(", ") || "—",
    },
    { header: "Tồn kho", accessor: "stockQuantity" },
    { header: "Đã giữ", accessor: "reserved" },
    { header: "Khả dụng", accessor: "available" },
    {
      header: "Trạng thái",
      accessor: "stockStatus",
      render: (row) => (
        <Badge variant={STATUS_VARIANT[row.stockStatus]}>{STATUS_LABEL[row.stockStatus]}</Badge>
      ),
    },
  ];

  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard
          label="Tổng số SKU"
          value={data?.totalSkus ?? "—"}
          icon={<Boxes size={16} className="text-hub-500" />}
          iconBg="#EEF1FF"
        />
        <StatCard
          label="Sắp hết hàng"
          value={data?.lowStock ?? "—"}
          icon={<TriangleAlert size={16} className="text-warning" />}
          iconBg="#FFF4E0"
        />
        <StatCard
          label="Hết hàng"
          value={data?.outOfStock ?? "—"}
          icon={<PackageX size={16} className="text-error" />}
          iconBg="#FDEAEC"
        />
      </div>

      {(data?.lowStock ?? 0) > 0 && (
        <div className="flex items-center gap-2.5 rounded-2xl border border-warning/30 bg-warning-tint px-4 py-3 text-sm font-bold font-manrope text-warning">
          <AlertTriangle size={16} />
          Có {data?.lowStock} sản phẩm sắp hết hàng, hãy nhập thêm hàng để tránh gián đoạn bán hàng.
        </div>
      )}

      <Tabs
        tabs={TABS.map((t) => ({ value: t.value, label: t.label }))}
        value={status}
        onChange={(value) => setStatus(value as InventoryStatusFilter)}
      />

      {isError && (
        <p className="text-sm font-manrope text-error">Không thể tải dữ liệu kho hàng.</p>
      )}

      {isLoading ? (
        <p className="text-sm font-manrope text-neutral-500">Đang tải...</p>
      ) : (
        <Table columns={columns} rows={data?.items ?? []} rowKey={(row) => row.id} />
      )}
    </div>
  );
}
