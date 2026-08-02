import { useState } from "react";
import { Tabs, type TabItem } from "../../../shared/components/Tabs";
import { RevenueTab } from "./RevenueTab";
import { UsersTab } from "./UsersTab";
import { OrderOpsTab } from "./OrderOpsTab";

const REPORT_TABS: TabItem[] = [
  { value: "revenue", label: "Doanh thu" },
  { value: "users", label: "Người dùng" },
  { value: "orders", label: "Vận hành đơn hàng" },
];

export function AdminReportsPage() {
  const [tab, setTab] = useState("revenue");

  return (
    <div className="flex flex-col gap-5">
      <Tabs tabs={REPORT_TABS} value={tab} onChange={setTab} />
      {tab === "revenue" && <RevenueTab />}
      {tab === "users" && <UsersTab />}
      {tab === "orders" && <OrderOpsTab />}
    </div>
  );
}
