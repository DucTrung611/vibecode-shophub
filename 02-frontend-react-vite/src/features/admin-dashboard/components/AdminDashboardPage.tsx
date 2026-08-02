import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis } from "recharts";
import { useNavigate } from "react-router";
import { ChevronRight, PackageSearch, Receipt, Store, Users, Wallet } from "lucide-react";
import { Card } from "../../../shared/components/Card";
import { StatCard } from "../../../shared/components/StatCard";
import { Table, type TableColumn } from "../../../shared/components/Table";
import { Badge, type BadgeVariant } from "../../../shared/components/Badge";
import { formatDate } from "../../../shared/utils/format";
import { useAdminDashboard } from "../hooks/useAdminDashboard";
import type { NewShop } from "../types/admin-dashboard.types";

const KPI_ICONS = [Wallet, Users, Store, Receipt];
const KPI_ICON_BG = ["#E6F7EE", "#EAF1FD", "#FFF4E0", "#FDEAEC"];

const SHOP_STATUS_LABEL: Record<NewShop["status"], { label: string; variant: BadgeVariant }> = {
  pending: { label: "Chờ duyệt", variant: "warning" },
  approved: { label: "Đã duyệt", variant: "success" },
  suspended: { label: "Tạm ngưng", variant: "error" },
  rejected: { label: "Từ chối", variant: "error" },
};

const NEEDS_ACTION_TARGET: Record<string, string> = {
  "Gian hàng chờ duyệt": "/admin/shops",
  "Sản phẩm chờ kiểm duyệt": "/admin/products",
};

export function AdminDashboardPage() {
  const navigate = useNavigate();
  const { data, isLoading, isError } = useAdminDashboard();

  const columns: TableColumn<NewShop>[] = [
    { header: "Tên shop", accessor: "name" },
    {
      header: "Ngày đăng ký",
      accessor: "createdAt",
      render: (row) => formatDate(row.createdAt),
    },
    {
      header: "Trạng thái",
      accessor: "status",
      render: (row) => {
        const meta = SHOP_STATUS_LABEL[row.status];
        return <Badge variant={meta.variant}>{meta.label}</Badge>;
      },
    },
  ];

  if (isLoading) {
    return <p className="text-sm font-manrope text-neutral-500">Đang tải...</p>;
  }

  if (isError || !data) {
    return (
      <p className="text-sm font-manrope text-error">
        Không thể tải dữ liệu tổng quan. Vui lòng thử lại.
      </p>
    );
  }

  const maxTopCategory = Math.max(...data.topCategories.map((c) => c.count), 1);

  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-4 gap-4">
        {data.kpis.map((kpi, index) => {
          const Icon = KPI_ICONS[index] ?? Wallet;
          return (
            <StatCard
              key={kpi.label}
              label={kpi.label}
              value={kpi.value}
              icon={<Icon size={16} />}
              iconBg={KPI_ICON_BG[index]}
              delta={
                kpi.pendingCount !== undefined
                  ? `${kpi.pendingCount} chờ duyệt`
                  : undefined
              }
              deltaColor={kpi.pendingCount !== undefined ? "#D97706" : undefined}
            />
          );
        })}
      </div>

      <div className="grid grid-cols-[1.6fr_1fr] gap-4">
        <Card>
          <h2 className="mb-5 font-sora text-sm font-extrabold text-neutral-900">
            Tổng giá trị giao dịch (GMV)
          </h2>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={data.gmvWeekly} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
              <XAxis
                dataKey="label"
                tickLine={false}
                axisLine={false}
                tick={{ fontSize: 10, fill: "#9AA1B9" }}
              />
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
            Cần xử lý
          </h2>
          <div className="flex flex-col gap-2.5">
            {data.needsAction.map((item) => {
              const target = NEEDS_ACTION_TARGET[item.label];
              const Icon = item.label.includes("Sản phẩm") ? PackageSearch : Store;
              return (
                <button
                  key={item.label}
                  type="button"
                  onClick={() => target && navigate(target)}
                  disabled={!target}
                  className="flex items-center gap-3 rounded-[10px] bg-warning-tint p-3 text-left transition-opacity hover:opacity-90 disabled:cursor-default"
                >
                  <div className="flex h-[34px] w-[34px] items-center justify-center rounded-[9px] bg-white">
                    <Icon size={16} className="text-neutral-700" />
                  </div>
                  <div className="flex-1">
                    <div className="text-xs font-bold font-manrope text-neutral-900">
                      {item.label}
                    </div>
                    <div className="text-[11px] font-manrope text-neutral-500">
                      {item.count} cần duyệt
                    </div>
                  </div>
                  {target && <ChevronRight size={14} className="text-neutral-400" />}
                </button>
              );
            })}
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-[1.6fr_1fr] gap-4">
        <Card padded={false} className="overflow-hidden">
          <div className="flex items-center justify-between border-b border-neutral-100 px-6 py-4">
            <h2 className="font-sora text-sm font-extrabold text-neutral-900">
              Shop mới đăng ký
            </h2>
          </div>
          <Table columns={columns} rows={data.newShops} rowKey={(row) => row.id} />
        </Card>

        <Card>
          <h2 className="mb-4 font-sora text-sm font-extrabold text-neutral-900">
            Danh mục hàng đầu
          </h2>
          <div className="flex flex-col gap-3.5">
            {data.topCategories.map((category) => (
              <div key={category.categoryId}>
                <div className="mb-1.5 flex justify-between text-xs font-manrope">
                  <span className="font-semibold text-neutral-700">{category.name}</span>
                  <span className="font-bold text-neutral-900">{category.count}</span>
                </div>
                <div className="h-1.5 overflow-hidden rounded-full bg-neutral-100">
                  <div
                    className="h-full bg-hub-500"
                    style={{ width: `${(category.count / maxTopCategory) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
