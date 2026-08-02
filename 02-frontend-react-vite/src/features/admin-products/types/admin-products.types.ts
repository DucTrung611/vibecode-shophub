export interface ProductImage {
  id: number;
  url: string;
  sortOrder: number;
}

export interface ProductVariant {
  id: number;
  sku: string;
  attributes: Record<string, unknown>;
  price: string;
  compareAtPrice: string | null;
  stockQuantity: number;
}

export interface FlaggedProduct {
  id: number;
  shopId: number;
  categoryId: number;
  name: string;
  slug: string;
  status: "draft" | "active" | "inactive" | "flagged";
  ratingAvg: string;
  soldCount: number;
  flagReason: string | null;
  createdAt: string;
  updatedAt: string;
  images: ProductImage[];
  variants: ProductVariant[];
}

export type ModerationAction = "approve" | "request_changes" | "remove";

export interface ModerateProductPayload {
  action: ModerationAction;
  note?: string;
}

export interface ListFlaggedProductsParams {
  page: number;
  limit: number;
}
