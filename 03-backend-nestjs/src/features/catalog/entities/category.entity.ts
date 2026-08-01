export interface CategoryEntity {
  id: number;
  parentId: number | null;
  name: string;
  slug: string;
  sortOrder: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface CategoryTreeNode extends CategoryEntity {
  children: CategoryTreeNode[];
}
