export interface WishlistProductVariant {
  id: number;
  price: string;
  compareAtPrice: string | null;
  stockQuantity: number;
}

export interface WishlistProductImage {
  id: number;
  url: string;
  sortOrder: number;
}

export interface WishlistProduct {
  id: number;
  name: string;
  slug: string;
  status: "draft" | "active" | "inactive";
  images: WishlistProductImage[];
  variants: WishlistProductVariant[];
  shop: { id: number; name: string; slug: string };
}

export interface WishlistItem {
  id: number;
  userId: number;
  productId: number;
  createdAt: string;
  product: WishlistProduct;
}
