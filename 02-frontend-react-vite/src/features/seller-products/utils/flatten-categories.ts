import type { Category } from "../types/product.types";

export interface FlatCategory {
  id: number;
  label: string;
  depth: number;
}

export function flattenCategories(categories: Category[], depth = 0): FlatCategory[] {
  return categories.flatMap((category) => [
    { id: category.id, label: `${"— ".repeat(depth)}${category.name}`, depth },
    ...flattenCategories(category.children ?? [], depth + 1),
  ]);
}
