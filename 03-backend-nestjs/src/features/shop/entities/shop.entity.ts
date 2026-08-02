import type { Prisma } from '../../../../generated/prisma/client';

export interface ShopEntity {
  id: number;
  ownerId: number;
  name: string;
  slug: string;
  status: 'pending' | 'approved' | 'suspended' | 'rejected';
  ratingAvg: Prisma.Decimal;
  totalSold: number;
  businessLicenseUrl: string | null;
  documents: Prisma.JsonValue | null;
  rejectionReason: string | null;
  createdAt: Date;
  updatedAt: Date;
}
