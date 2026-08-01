import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../core/database/prisma.service';
import { CategoryEntity, CategoryTreeNode } from './entities/category.entity';

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
