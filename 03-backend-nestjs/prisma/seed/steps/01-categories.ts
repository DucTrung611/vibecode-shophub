import type { PrismaClient } from '../../../generated/prisma/client';
import { SEED_CATEGORIES } from '../data/categories';

export interface SeededCategory {
  id: number;
  slug: string;
  name: string;
  minPrice: number;
  maxPrice: number;
}

export async function seedCategories(prisma: PrismaClient): Promise<SeededCategory[]> {
  const created = await prisma.category.createManyAndReturn({
    data: SEED_CATEGORIES.map((c, index) => ({
      name: c.name,
      slug: c.slug,
      sortOrder: index,
      commissionRate: c.commissionRate,
      isActive: true,
    })),
  });

  console.log(`  Seeded ${created.length} categories`);

  return created.map((row) => {
    const source = SEED_CATEGORIES.find((c) => c.slug === row.slug)!;
    return { id: row.id, slug: row.slug, name: row.name, minPrice: source.minPrice, maxPrice: source.maxPrice };
  });
}
