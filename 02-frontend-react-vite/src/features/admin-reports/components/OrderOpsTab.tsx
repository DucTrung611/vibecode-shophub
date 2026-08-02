import { Card } from "../../../shared/components/Card";
import { Table, type TableColumn } from "../../../shared/components/Table";
import { useOrderOpsReport } from "../hooks/useAdminReports";
import type { CarrierPerformance } from "../types/admin-reports.types";

export function OrderOpsTab() {
  const { data, isLoading, isError } = useOrderOpsReport();

  const columns: TableColumn<CarrierPerformance>[] = [
    { header: "Đơn vị", accessor: "carrier" },
    { header: "Đơn giao", accessor: "totalShipments" },
    { header: "Đã giao", accessor: "delivered" },
    {
      header: "Tỷ lệ giao thành công",
      accessor: "deliveryRate",
      render: (row) => `${(row.deliveryRate * 100).toFixed(1)}%`,
    },
  ];

  if (isLoading) {
    return <p className="text-sm font-manrope text-neutral-500">Đang tải...</p>;
  }

  if (isError || !data) {
    return <p className="text-sm font-manrope text-error">Không thể tải báo cáo vận hành đơn hàng.</p>;
  }

  return (
    <Card padded={false} className="overflow-hidden">
      <div className="border-b border-neutral-100 px-6 py-4 font-sora text-sm font-extrabold text-neutral-900">
        Hiệu suất đơn vị vận chuyển
      </div>
      <Table columns={columns} rows={data} rowKey={(row) => row.carrier} />
    </Card>
  );
}
