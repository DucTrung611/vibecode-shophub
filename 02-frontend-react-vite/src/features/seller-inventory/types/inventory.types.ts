export type StockStatus = "in_stock" | "low_stock" | "out_of_stock";
export type InventoryStatusFilter = "all" | StockStatus;

export interface InventoryItem {
  id: number;
  sku: string;
  productName: string;
  attributes: Record<string, string>;
  stockQuantity: number;
  reserved: number;
  available: number;
  stockStatus: StockStatus;
}

export interface InventorySummary {
  totalSkus: number;
  outOfStock: number;
  lowStock: number;
  items: InventoryItem[];
}
