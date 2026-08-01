"use client";

import Link from "next/link";
import { useState } from "react";
import { OrderCard, useOrders, type OrderStatus } from "@/features/order";
import { RequireAuth } from "@/shared/components/RequireAuth";

const TABS: { value: OrderStatus | undefined; label: string }[] = [
  { value: undefined, label: "Tất cả" },
  { value: "pending", label: "Chờ xác nhận" },
  { value: "confirmed", label: "Đã xác nhận" },
  { value: "shipped", label: "Đang giao" },
  { value: "delivered", label: "Đã giao" },
  { value: "cancelled", label: "Đã hủy" },
];

function OrdersPageContent() {
  const [status, setStatus] = useState<OrderStatus | undefined>(undefined);
  const { data: orders, isLoading } = useOrders(status);

  return (
    <div className="mx-auto flex max-w-[900px] flex-col gap-4 px-4 py-6 md:px-6">
      <h1 className="text-xl font-bold font-sora text-neutral-900">Đơn hàng của tôi</h1>

      <div className="flex gap-2 overflow-x-auto pb-1">
        {TABS.map((tab) => (
          <button
            key={tab.label}
            type="button"
            onClick={() => setStatus(tab.value)}
            className={[
              "shrink-0 rounded-full border px-3.5 py-1.5 text-xs font-manrope",
              status === tab.value
                ? "border-hub-500 bg-hub-50 text-hub-600"
                : "border-neutral-200 text-neutral-600",
            ].join(" ")}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {isLoading ? (
        <p className="py-10 text-center text-sm font-manrope text-neutral-500">Đang tải...</p>
      ) : !orders || orders.length === 0 ? (
        <div className="flex flex-col items-center gap-3 py-16 text-center">
          <span className="text-4xl">🧾</span>
          <p className="font-manrope text-neutral-500">Chưa có đơn hàng nào</p>
          <Link href="/products" className="text-sm font-bold text-hub-600">
            Mua sắm ngay
          </Link>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {orders.map((order) => (
            <OrderCard key={order.id} order={order} />
          ))}
        </div>
      )}
    </div>
  );
}

export default function OrdersPage() {
  return (
    <RequireAuth>
      <OrdersPageContent />
    </RequireAuth>
  );
}
