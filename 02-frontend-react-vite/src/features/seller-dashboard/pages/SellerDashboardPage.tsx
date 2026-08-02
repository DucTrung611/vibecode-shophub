import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { CircleX, ClipboardList, Package, Wallet } from "lucide-react";
import { Badge } from "../../../shared/components/Badge";
import { Card } from "../../../shared/components/Card";
import { StatCard } from "../../../shared/components/StatCard";
import { Table, type TableColumn } from "../../../shared/components/Table";
import { formatCurrency, formatDate } from "../../../shared/utils/format";
import { useSellerDashboard } from "../hooks/useSellerDashboard";
import type { RecentOrder, TopProduct } from "../types/dashboard.types";
import { orderStatusLabel, orderStatusVariant } from "../utils/order-status.util";

const KPI_ICONS = [Wallet, ClipboardList, Package, CircleX];
const KPI_ICON_BG = ["#EEF1FF", "#EAF1FD", "#E6F7EE", "#FDEAEC"];

export function SellerDashboardPage() {
  const { data, isLoading, isError } = useSellerDashboard();

  if (isLoading) {
    return (
      <div className="flex min-h-[320px] items-center justify-center text-sm font-manrope text-neutral-500">
        Đang tải dữ liệu tổng quan...
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="flex min-h-[320px] items-center justify-center text-sm font-manrope text-error">
        Không thể tải dữ liệu tổng quan. Vui lòng thử lại sau.
      </div>
    );
  }

  const recentOrderColumns: TableColumn<RecentOrder>[] = [
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

  const topProductColumns: TableColumn<TopProduct>[] = [
    { header: "Sản phẩm", accessor: "name" },
    { header: "Đã bán", accessor: "soldCount" },
  ];

  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {data.kpis.map((kpi, index) => {
          const Icon = KPI_ICONS[index % KPI_ICONS.length];
          return (
            <StatCard
              key={kpi.label}
              label={kpi.label}
              value={
                kpi.label.toLowerCase().includes("doanh thu")
                  ? formatCurrency(kpi.value)
                  : kpi.value
              }
              delta={
                kpi.pendingCount !== undefined
                  ? `${kpi.pendingCount} đang chờ xử lý`
                  : undefined
              }
              deltaColor="#D97706"
              icon={<Icon size={16} className="text-hub-500" />}
              iconBg={KPI_ICON_BG[index % KPI_ICON_BG.length]}
            />
          );
        })}
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <Card>
          <h2 className="mb-4 font-sora text-base font-extrabold text-neutral-900">
            Doanh thu 7 ngày gần nhất
          </h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.revenueBars}>
                <XAxis
                  dataKey="label"
                  tick={{ fontSize: 12, fontFamily: "Manrope" }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fontSize: 12, fontFamily: "Manrope" }}
                  axisLine={false}
                  tickLine={false}
                  width={40}
                />
                <Tooltip formatter={(value) => formatCurrency(Number(value ?? 0))} />
                <Bar dataKey="value" fill="#3A56E8" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card>
          <h2 className="mb-4 font-sora text-base font-extrabold text-neutral-900">
            Trạng thái đơn hàng
          </h2>
          <div className="flex flex-col gap-3">
            {data.orderStatusBreakdown.map((item) => {
              const max = Math.max(
                1,
                ...data.orderStatusBreakdown.map((entry) => entry.count),
              );
              const width = Math.round((item.count / max) * 100);
              return (
                <div key={item.status} className="flex items-center gap-3">
                  <div className="w-28 shrink-0">
                    <Badge variant={orderStatusVariant(item.status)}>
                      {orderStatusLabel(item.status)}
                    </Badge>
                  </div>
                  <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-neutral-100">
                    <div
                      className="h-full rounded-full bg-hub-500"
                      style={{ width: `${width}%` }}
                    />
                  </div>
                  <span className="w-8 text-right text-sm font-bold font-manrope text-neutral-700">
                    {item.count}
                  </span>
                </div>
              );
            })}
          </div>
        </Card>
      </div>

      <Card padded={false}>
        <div className="border-b border-neutral-200 p-5">
          <h2 className="font-sora text-base font-extrabold text-neutral-900">
            Đơn hàng gần đây
          </h2>
        </div>
        <div className="p-5">
          <Table columns={recentOrderColumns} rows={data.recentOrders} rowKey={(row) => row.id} />
        </div>
      </Card>

      <Card padded={false}>
        <div className="border-b border-neutral-200 p-5">
          <h2 className="font-sora text-base font-extrabold text-neutral-900">
            Sản phẩm bán chạy
          </h2>
        </div>
        <div className="p-5">
          <Table columns={topProductColumns} rows={data.topProducts} rowKey={(row) => row.id} />
        </div>
      </Card>
    </div>
  );
}
