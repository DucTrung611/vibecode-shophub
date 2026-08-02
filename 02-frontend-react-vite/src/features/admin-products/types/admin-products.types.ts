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

export type ModerationAction = "approve" | "request_changes" | "remove";

export interface ProductModerationLog {
  id: number;
  productId: number;
  adminId: number;
  action: ModerationAction;
  note: string | null;
  createdAt: string;
  admin: { id: number; fullName: string };
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
  moderationLogs: ProductModerationLog[];
}

export interface ModerateProductPayload {
  action: ModerationAction;
  note?: string;
}

export interface ListFlaggedProductsParams {
  page: number;
  limit: number;
}
