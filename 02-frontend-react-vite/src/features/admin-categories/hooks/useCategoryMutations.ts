import { useMutation, useQueryClient } from "@tanstack/react-query";
import { notify } from "../../../shared/services/notify";
import { ApiError } from "../../../shared/types/api-response.types";
import * as adminCategoriesService from "../services/admin-categories.service";
import type { CreateCategoryPayload, UpdateCategoryPayload } from "../types/admin-categories.types";

export function useCreateCategory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateCategoryPayload) => adminCategoriesService.createCategory(payload),
    onSuccess: () => {
      notify.success("Đã thêm danh mục mới");
      void queryClient.invalidateQueries({ queryKey: ["admin-categories"] });
    },
    onError: () => notify.error("Không thể tạo danh mục. Vui lòng thử lại."),
  });
}

export function useUpdateCategory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: UpdateCategoryPayload }) =>
      adminCategoriesService.updateCategory(id, payload),
    onSuccess: () => {
      notify.success("Đã cập nhật danh mục");
      void queryClient.invalidateQueries({ queryKey: ["admin-categories"] });
    },
    onError: () => notify.error("Không thể cập nhật danh mục. Vui lòng thử lại."),
  });
}

export function useDeleteCategory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => adminCategoriesService.deleteCategory(id),
    onSuccess: () => {
      notify.success("Đã xóa danh mục");
      void queryClient.invalidateQueries({ queryKey: ["admin-categories"] });
    },
    onError: (error) => {
      if (error instanceof ApiError && error.code === "CATEGORY_001") {
        notify.error("Không thể xóa: danh mục còn sản phẩm hoặc danh mục con");
        return;
      }
      notify.error("Không thể xóa danh mục. Vui lòng thử lại.");
    },
  });
}
