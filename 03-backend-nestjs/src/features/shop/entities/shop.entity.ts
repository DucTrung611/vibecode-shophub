import type { Prisma } from '../../../../generated/prisma/client';

export interface ShopEntity {
  id: number;
  ownerId: number;
  name: string;
  slug: string;
  status: 'pending' | 'approved' | 'suspended' | 'rejected';
  ratingAvg: Prisma.Decimal;
  totalSold: number;
  createdAt: Date;
  updatedAt: Date;
}
