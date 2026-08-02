export interface CartItemProductImage {
  id: number;
  url: string;
  sortOrder: number;
}

export interface CartItemVariant {
  id: number;
  productId: number;
  sku: string;
  attributes: Record<string, string>;
  price: string;
  compareAtPrice: string | null;
  stockQuantity: number;
  product: {
    id: number;
    name: string;
    slug: string;
    shopId: number;
    shop: { name: string };
    images: CartItemProductImage[];
  };
}

export interface CartItem {
  id: number;
  cartId: number;
  variantId: number;
  quantity: number;
  variant: CartItemVariant;
}

export interface Cart {
  cartId: number;
  items: CartItem[];
}
