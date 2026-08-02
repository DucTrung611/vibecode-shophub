import type { BadgeVariant } from "../../../shared/components/Badge";
import type { ProductStatus } from "../types/product.types";

export const PRODUCT_STATUS_LABEL: Record<ProductStatus, string> = {
  draft: "Nháp",
  active: "Đang bán",
  inactive: "Đã ẩn",
  flagged: "Chờ kiểm duyệt",
};

export const PRODUCT_STATUS_VARIANT: Record<ProductStatus, BadgeVariant> = {
  draft: "neutral",
  active: "success",
  inactive: "warning",
  flagged: "error",
};

export function productStatusLabel(status: ProductStatus): string {
  return PRODUCT_STATUS_LABEL[status] ?? status;
}

export function productStatusVariant(status: ProductStatus): BadgeVariant {
  return PRODUCT_STATUS_VARIANT[status] ?? "neutral";
}
