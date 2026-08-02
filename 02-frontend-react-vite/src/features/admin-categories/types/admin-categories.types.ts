export interface CategoryTreeNode {
  id: number;
  parentId: number | null;
  name: string;
  slug: string;
  sortOrder: number;
  commissionRate: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  children: CategoryTreeNode[];
}

export interface FlatCategory extends CategoryTreeNode {
  depth: number;
}

export interface CreateCategoryPayload {
  name: string;
  parentId?: number;
  sortOrder?: number;
  commissionRate?: number;
}

export interface UpdateCategoryPayload {
  name?: string;
  parentId?: number;
  sortOrder?: number;
  commissionRate?: number;
  isActive?: boolean;
}
