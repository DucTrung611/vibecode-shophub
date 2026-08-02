import type { BadgeVariant } from "../../../shared/components/Badge";
import type { OrderStatus } from "../types/order.types";

export const ORDER_STATUS_LABEL: Record<OrderStatus, string> = {
  pending: "Chờ xác nhận",
  confirmed: "Đã xác nhận",
  shipped: "Đang giao",
  delivered: "Đã giao",
  cancelled: "Đã hủy",
};

export const ORDER_STATUS_VARIANT: Record<OrderStatus, BadgeVariant> = {
  pending: "warning",
  confirmed: "info",
  shipped: "info",
  delivered: "success",
  cancelled: "error",
};

// Valid fulfillment transitions per API_SPEC.md §6 (order) / §7.3 — the UI only
// ever offers a next status that's actually a legal transition.
export const NEXT_STATUS_OPTIONS: Record<OrderStatus, OrderStatus[]> = {
  pending: ["confirmed", "cancelled"],
  confirmed: ["shipped", "cancelled"],
  shipped: ["delivered"],
  delivered: [],
  cancelled: [],
};

export function orderStatusLabel(status: OrderStatus): string {
  return ORDER_STATUS_LABEL[status] ?? status;
}

export function orderStatusVariant(status: OrderStatus): BadgeVariant {
  return ORDER_STATUS_VARIANT[status] ?? "neutral";
}
