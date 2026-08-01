export const CATALOG_PORT = Symbol('CATALOG_PORT');

export interface CatalogVariantForCart {
  id: number;
  productId: number;
  productName: string;
  attributes: unknown;
  price: string;
  stockQuantity: number;
}

export interface CatalogPort {
  getVariantForCart(variantId: number): Promise<CatalogVariantForCart | null>;
  decrementVariantStock(variantId: number, quantity: number): Promise<void>;
  incrementProductSoldCount(productId: number, quantity: number): Promise<void>;
  updateProductRating(productId: number, ratingAvg: number): Promise<void>;
}
