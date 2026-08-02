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
  description: string | null;
  logoUrl: string | null;
  bannerUrl: string | null;
  phone: string | null;
  email: string | null;
  province: string | null;
  district: string | null;
  ward: string | null;
  detailAddress: string | null;
  shippingSettings: Prisma.JsonValue | null;
  paymentSettings: Prisma.JsonValue | null;
  notificationSettings: Prisma.JsonValue | null;
  createdAt: Date;
  updatedAt: Date;
}
