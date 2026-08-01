export interface Category {
  id: number;
  parentId: number | null;
  name: string;
  slug: string;
  sortOrder: number;
  children: Category[];
}

export interface ProductImage {
  id: number;
  url: string;
  sortOrder: number;
}

export interface ProductVariant {
  id: number;
  productId: number;
  sku: string;
  attributes: Record<string, string>;
  price: string;
  compareAtPrice: string | null;
  stockQuantity: number;
}

export interface ProductListItem {
  id: number;
  shopId: number;
  categoryId: number;
  name: string;
  slug: string;
  status: "draft" | "active" | "inactive";
  ratingAvg: string;
  soldCount: number;
  images: ProductImage[];
  variants: ProductVariant[];
}

export interface ProductDetail extends ProductListItem {
  shop: { id: number; name: string; slug: string };
  category: { id: number; name: string; slug: string };
}

export interface ProductListFilters {
  page?: number;
  limit?: number;
  categoryId?: number;
  shopId?: number;
  minPrice?: number;
  maxPrice?: number;
  sortBy?: "createdAt" | "soldCount" | "ratingAvg";
  order?: "asc" | "desc";
}

export interface ProductListResult {
  items: ProductListItem[];
  total: number;
  page: number;
  limit: number;
}
