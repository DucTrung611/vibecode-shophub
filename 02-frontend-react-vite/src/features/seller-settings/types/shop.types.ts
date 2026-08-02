export interface Shop {
  id: number;
  ownerId: number;
  name: string;
  slug: string;
  status: string;
  ratingAvg?: number;
  totalSold?: number;
  businessLicenseUrl?: string | null;
  documents?: unknown;
  rejectionReason?: string | null;
}
