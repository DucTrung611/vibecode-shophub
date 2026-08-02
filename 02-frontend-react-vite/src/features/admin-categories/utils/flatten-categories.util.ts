import type { CategoryTreeNode, FlatCategory } from "../types/admin-categories.types";

export function flattenCategories(nodes: CategoryTreeNode[], depth = 0): FlatCategory[] {
  return nodes.flatMap((node) => [
    { ...node, depth },
    ...flattenCategories(node.children, depth + 1),
  ]);
}
