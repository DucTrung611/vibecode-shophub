export type ProductStatus = "draft" | "active" | "inactive" | "flagged";

export interface Category {
  id: number;
  parentId: number | null;
  name: string;
  slug: string;
  sortOrder: number;
  commissionRate: number;
  isActive: boolean;
  children?: Category[];
}

export interface ProductListItem {
  id: number;
  shopId: number;
  categoryId: number;
  name: string;
  slug: string;
  status: ProductStatus;
  ratingAvg: number;
  soldCount: number;
  createdAt: string;
}

export interface ProductVariant {
  id: number;
  productId: number;
  sku: string;
  attributes: Record<string, string>;
  price: number;
  compareAtPrice: number | null;
  stockQuantity: number;
}

export interface ProductImage {
  id: number;
  url: string;
  sortOrder: number;
}

export interface ProductDetail extends ProductListItem {
  variants: ProductVariant[];
  images: ProductImage[];
}
