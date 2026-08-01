"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import {
  OrderStatusBadge,
  ShippingTimeline,
  useCancelOrder,
  useOrder,
} from "@/features/order";
import { Button } from "@/shared/components/Button";
import { RequireAuth } from "@/shared/components/RequireAuth";
import { formatPrice } from "@/shared/utils/format-price";

function OrderDetailPageContent() {
  const params = useParams<{ id: string }>();
  const orderId = Number(params.id);
  const { data: order, isLoading } = useOrder(orderId);
  const cancelOrder = useCancelOrder();

  if (isLoading) {
    return (
      <div className="px-4 py-16 text-center text-sm font-manrope text-neutral-500">
        Đang tải đơn hàng...
      </div>
    );
  }

  if (!order) {
    return (
      <div className="px-4 py-16 text-center">
        <p className="font-manrope text-neutral-500">Không tìm thấy đơn hàng</p>
        <Link href="/orders" className="mt-2 inline-block text-sm font-bold text-hub-600">
          Quay lại danh sách đơn hàng
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto flex max-w-[900px] flex-col gap-6 px-4 py-6 md:px-6">
      <Link href="/orders" className="text-sm font-manrope text-hub-600">
        ← Quay lại danh sách đơn hàng
      </Link>

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-bold font-sora text-neutral-900">{order.orderCode}</h1>
          <p className="text-xs text-neutral-500 font-manrope">
            Đặt ngày {new Date(order.createdAt).toLocaleDateString("vi-VN")}
          </p>
        </div>
        <OrderStatusBadge status={order.status} />
      </div>

      <section className="rounded-2xl border border-neutral-100 p-4">
        <h2 className="mb-3 text-sm font-bold font-sora text-neutral-900">Trạng thái vận chuyển</h2>
        <ShippingTimeline status={order.status} />
      </section>

      <section className="rounded-2xl border border-neutral-100 p-4">
        <h2 className="mb-2 text-sm font-bold font-sora text-neutral-900">Địa chỉ giao hàng</h2>
        <p className="text-sm font-manrope text-neutral-700">
          {order.shippingAddress.recipientName} · {order.shippingAddress.phone}
        </p>
        <p className="text-sm font-manrope text-neutral-500">
          {[
            order.shippingAddress.detailAddress,
            order.shippingAddress.ward,
            order.shippingAddress.district,
            order.shippingAddress.province,
          ].join(", ")}
        </p>
      </section>

      <section className="rounded-2xl border border-neutral-100 p-4">
        <h2 className="mb-2 text-sm font-bold font-sora text-neutral-900">Sản phẩm</h2>
        {order.items.map((item) => (
          <div
            key={item.id}
            className="flex justify-between border-b border-neutral-100 py-2 text-sm font-manrope text-neutral-700 last:border-b-0"
          >
            <span>
              {item.productNameSnapshot} x{item.quantity}
            </span>
            <span>{formatPrice(item.subtotal)}</span>
          </div>
        ))}
        <div className="mt-2 flex justify-between pt-2 text-sm font-bold font-sora text-hub-600">
          <span>Tổng cộng</span>
          <span>{formatPrice(order.totalAmount)}</span>
        </div>
      </section>

      {order.status === "pending" && (
        <div className="w-40">
          <Button
            type="button"
            variant="outline"
            isLoading={cancelOrder.isPending}
            onClick={() => cancelOrder.mutate(order.id)}
          >
            Hủy đơn hàng
          </Button>
        </div>
      )}
    </div>
  );
}

export default function OrderDetailPage() {
  return (
    <RequireAuth>
      <OrderDetailPageContent />
    </RequireAuth>
  );
}
