export const VARIANT_STOCK_CHANGED = 'variant.stock.changed';

export interface VariantStockChangedEvent {
  variantId: number;
  stockQuantity: number;
}
