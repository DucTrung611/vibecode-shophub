import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis } from "recharts";
import { Card } from "../../../shared/components/Card";
import { StatCard } from "../../../shared/components/StatCard";
import { Table, type TableColumn } from "../../../shared/components/Table";
import { useRevenueReport } from "../hooks/useAdminReports";
import type { TopSeller } from "../types/admin-reports.types";

export function RevenueTab() {
  const { data, isLoading, isError } = useRevenueReport();

  if (isLoading) {
    return <p className="text-sm font-manrope text-neutral-500">Đang tải...</p>;
  }

  if (isError || !data) {
    return <p className="text-sm font-manrope text-error">Không thể tải báo cáo doanh thu.</p>;
  }

  const maxCategory = Math.max(...data.categoryBreakdown.map((c) => c.count), 1);

  const columns: TableColumn<TopSeller & { rank: number }>[] = [
    { header: "#", accessor: "rank" },
    { header: "Gian hàng", accessor: "name" },
  ];

  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-4 gap-4">
        {data.kpis.map((kpi) => (
          <StatCard key={kpi.label} label={kpi.label} value={kpi.value} icon={null} iconBg="transparent" />
        ))}
      </div>

      <div className="grid grid-cols-[1.6fr_1fr] gap-4">
        <Card>
          <h2 className="mb-5 font-sora text-sm font-extrabold text-neutral-900">
            Doanh thu theo tuần
          </h2>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={data.weeklyBars} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
              <XAxis dataKey="label" tickLine={false} axisLine={false} tick={{ fontSize: 10, fill: "#9AA1B9" }} />
              <Tooltip
                cursor={{ fill: "#EEF1FF" }}
                formatter={(value) =>
                  typeof value === "number" ? value.toLocaleString("vi-VN") : String(value)
                }
              />
              <Bar dataKey="value" fill="#3A56E8" radius={[6, 6, 0, 0]} maxBarSize={28} />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        <Card>
          <h2 className="mb-4 font-sora text-sm font-extrabold text-neutral-900">
            Doanh thu theo danh mục
          </h2>
          <div className="flex flex-col gap-3.5">
            {data.categoryBreakdown.map((category) => (
              <div key={category.categoryId}>
                <div className="mb-1.5 flex justify-between text-xs font-manrope">
                  <span className="font-semibold text-neutral-700">{category.name}</span>
                  <span className="font-bold text-neutral-900">{category.count}</span>
                </div>
                <div className="h-1.5 overflow-hidden rounded-full bg-neutral-100">
                  <div
                    className="h-full bg-hub-500"
                    style={{ width: `${(category.count / maxCategory) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <Card padded={false} className="overflow-hidden">
        <div className="border-b border-neutral-100 px-6 py-4 font-sora text-sm font-extrabold text-neutral-900">
          Top gian hàng
        </div>
        <Table
          columns={columns}
          rows={data.topSellers.map((seller, index) => ({ ...seller, rank: index + 1 }))}
          rowKey={(row) => row.id}
        />
      </Card>
    </div>
  );
}
