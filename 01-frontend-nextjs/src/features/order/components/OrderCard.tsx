import Link from "next/link";
import { formatPrice } from "../../../shared/utils/format-price";
import type { OrderListItem } from "../types/order.types";
import { OrderStatusBadge } from "./OrderStatusBadge";

interface OrderCardProps {
  order: OrderListItem;
}

export function OrderCard({ order }: OrderCardProps) {
  return (
    <Link
      href={`/orders/${order.id}`}
      className="flex flex-col gap-2 rounded-2xl border border-neutral-100 p-4"
    >
      <div className="flex items-center justify-between">
        <span className="text-xs font-manrope text-neutral-500">{order.orderCode}</span>
        <OrderStatusBadge status={order.status} />
      </div>
      <div className="flex flex-col gap-1">
        {order.items.slice(0, 2).map((item) => (
          <p key={item.id} className="text-sm font-manrope text-neutral-700">
            {item.productNameSnapshot} x{item.quantity}
          </p>
        ))}
        {order.items.length > 2 && (
          <p className="text-xs text-neutral-400 font-manrope">
            +{order.items.length - 2} sản phẩm khác
          </p>
        )}
      </div>
      <div className="flex items-center justify-between border-t border-neutral-100 pt-2">
        <span className="text-xs text-neutral-500 font-manrope">Tổng tiền</span>
        <span className="text-sm font-bold font-sora text-hub-600">
          {formatPrice(order.totalAmount)}
        </span>
      </div>
    </Link>
  );
}
