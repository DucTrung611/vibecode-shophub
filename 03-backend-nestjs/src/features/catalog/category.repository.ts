import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../core/database/prisma.service';
import { CategoryEntity, CategoryTreeNode } from './entities/category.entity';

export interface CreateCategoryData {
  name: string;
  slug: string;
  parentId?: number;
  sortOrder?: number;
  commissionRate?: number;
}

export interface UpdateCategoryData {
  name?: string;
  parentId?: number;
  sortOrder?: number;
  commissionRate?: number;
  isActive?: boolean;
}

@Injectable()
export class CategoryRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(): Promise<CategoryEntity[]> {
    return this.prisma.category.findMany({ orderBy: { sortOrder: 'asc' } });
  }

  async findTree(): Promise<CategoryTreeNode[]> {
    const categories = await this.findAll();
    return buildCategoryTree(categories);
  }

  findById(id: number): Promise<CategoryEntity | null> {
    return this.prisma.category.findUnique({ where: { id } });
  }

  create(data: CreateCategoryData): Promise<CategoryEntity> {
    return this.prisma.category.create({ data });
  }

  update(id: number, data: UpdateCategoryData): Promise<CategoryEntity> {
    return this.prisma.category.update({ where: { id }, data });
  }

  async delete(id: number): Promise<void> {
    await this.prisma.category.delete({ where: { id } });
  }

  async countProducts(id: number): Promise<number> {
    return this.prisma.product.count({ where: { categoryId: id } });
  }

  async countChildren(id: number): Promise<number> {
    return this.prisma.category.count({ where: { parentId: id } });
  }
}

function buildCategoryTree(categories: CategoryEntity[]): CategoryTreeNode[] {
  const nodesById = new Map<number, CategoryTreeNode>(
    categories.map((category) => [category.id, { ...category, children: [] }]),
  );

  const roots: CategoryTreeNode[] = [];
  for (const node of nodesById.values()) {
    if (node.parentId === null) {
      roots.push(node);
      continue;
    }
    const parent = nodesById.get(node.parentId);
    if (parent) {
      parent.children.push(node);
    } else {
      roots.push(node);
    }
  }
  return roots;
}
