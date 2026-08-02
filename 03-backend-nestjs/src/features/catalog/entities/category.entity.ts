import type { Prisma } from '../../../../generated/prisma/client';

export interface CategoryEntity {
  id: number;
  parentId: number | null;
  name: string;
  slug: string;
  sortOrder: number;
  commissionRate: Prisma.Decimal;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface CategoryTreeNode extends CategoryEntity {
  children: CategoryTreeNode[];
}
