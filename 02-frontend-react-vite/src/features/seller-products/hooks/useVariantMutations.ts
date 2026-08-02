import { useMutation, useQueryClient } from "@tanstack/react-query";
import { notify } from "../../../shared/services/notify";
import { createVariant, updateVariant } from "../services/variant.service";

export function useCreateVariant(productId: number, slug: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: Parameters<typeof createVariant>[1]) =>
      createVariant(productId, payload),
    onSuccess: () => {
      notify.success("Đã thêm phân loại");
      void queryClient.invalidateQueries({ queryKey: ["seller-products", "detail", slug] });
    },
    onError: () => {
      notify.error("Không thể thêm phân loại");
    },
  });
}

export function useUpdateVariant(productId: number, slug: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      variantId,
      payload,
    }: {
      variantId: number;
      payload: Parameters<typeof updateVariant>[2];
    }) => updateVariant(productId, variantId, payload),
    onSuccess: () => {
      notify.success("Đã cập nhật phân loại");
      void queryClient.invalidateQueries({ queryKey: ["seller-products", "detail", slug] });
    },
    onError: () => {
      notify.error("Không thể cập nhật phân loại");
    },
  });
}
