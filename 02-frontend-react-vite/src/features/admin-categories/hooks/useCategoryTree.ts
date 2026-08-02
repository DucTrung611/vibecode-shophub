import { useQuery } from "@tanstack/react-query";
import * as adminCategoriesService from "../services/admin-categories.service";

export function useCategoryTree() {
  return useQuery({
    queryKey: ["admin-categories"],
    queryFn: adminCategoriesService.getCategoryTree,
  });
}
