export interface ShopSummary {
  id: number;
  ownerId: number;
  name: string;
  slug: string;
  status: "pending" | "approved" | "suspended" | "rejected";
  ratingAvg: string;
  totalSold: number;
}
