import type { BadgeVariant } from "../../../shared/components/Badge";

export const ORDER_STATUS_LABEL: Record<string, string> = {
  pending: "Chờ xác nhận",
  confirmed: "Đã xác nhận",
  shipped: "Đang giao",
  delivered: "Đã giao",
  cancelled: "Đã hủy",
};

export const ORDER_STATUS_VARIANT: Record<string, BadgeVariant> = {
  pending: "warning",
  confirmed: "info",
  shipped: "info",
  delivered: "success",
  cancelled: "error",
};

export function orderStatusLabel(status: string): string {
  return ORDER_STATUS_LABEL[status] ?? status;
}

export function orderStatusVariant(status: string): BadgeVariant {
  return ORDER_STATUS_VARIANT[status] ?? "neutral";
}
