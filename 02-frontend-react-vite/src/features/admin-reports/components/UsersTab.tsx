import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis } from "recharts";
import { Card } from "../../../shared/components/Card";
import { useUserSignupReport } from "../hooks/useAdminReports";

export function UsersTab() {
  const { data, isLoading, isError } = useUserSignupReport();

  if (isLoading) {
    return <p className="text-sm font-manrope text-neutral-500">Đang tải...</p>;
  }

  if (isError || !data) {
    return <p className="text-sm font-manrope text-error">Không thể tải báo cáo người dùng.</p>;
  }

  return (
    <Card>
      <h2 className="mb-5 font-sora text-sm font-extrabold text-neutral-900">
        Tăng trưởng người dùng mới theo tuần
      </h2>
      <ResponsiveContainer width="100%" height={180}>
        <BarChart data={data} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
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
  );
}
