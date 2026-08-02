export type ShopStatus = "pending" | "approved" | "suspended" | "rejected";

export interface AdminShop {
  id: number;
  ownerId: number;
  name: string;
  slug: string;
  status: ShopStatus;
  ratingAvg: string;
  totalSold: number;
  businessLicenseUrl: string | null;
  documents: unknown;
  rejectionReason: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ListShopsParams {
  page: number;
  limit: number;
  status?: ShopStatus;
}

export interface UpdateShopStatusPayload {
  status: "approved" | "rejected" | "suspended";
  rejectionReason?: string;
}
