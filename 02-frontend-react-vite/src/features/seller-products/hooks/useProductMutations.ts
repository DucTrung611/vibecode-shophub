import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router";
import { notify } from "../../../shared/services/notify";
import {
  createProduct,
  deactivateProduct,
  updateProduct,
} from "../services/product.service";

export function useCreateProduct() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  return useMutation({
    mutationFn: createProduct,
    onSuccess: (product) => {
      notify.success("Đã tạo sản phẩm — tiếp tục thêm phân loại và ảnh");
      void queryClient.invalidateQueries({ queryKey: ["seller-products", "list"] });
      navigate(`/seller/products/${product.slug}/edit`);
    },
    onError: () => {
      notify.error("Không thể tạo sản phẩm, vui lòng thử lại");
    },
  });
}

export function useUpdateProduct(productId: number, slug: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: Parameters<typeof updateProduct>[1]) =>
      updateProduct(productId, payload),
    onSuccess: () => {
      notify.success("Đã lưu thay đổi sản phẩm");
      void queryClient.invalidateQueries({ queryKey: ["seller-products", "detail", slug] });
      void queryClient.invalidateQueries({ queryKey: ["seller-products", "list"] });
    },
    onError: () => {
      notify.error("Cập nhật sản phẩm thất bại");
    },
  });
}

export function useDeactivateProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deactivateProduct,
    onSuccess: () => {
      notify.success("Đã ẩn sản phẩm");
      void queryClient.invalidateQueries({ queryKey: ["seller-products", "list"] });
    },
    onError: () => {
      notify.error("Không thể ẩn sản phẩm");
    },
  });
}
