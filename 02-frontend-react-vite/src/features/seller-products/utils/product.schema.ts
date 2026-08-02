import { z } from "zod";

export const productBasicInfoSchema = z.object({
  name: z.string().min(1, "Vui lòng nhập tên sản phẩm"),
  categoryId: z.coerce.number().int().positive("Vui lòng chọn danh mục"),
});

export type ProductBasicInfoValues = z.infer<typeof productBasicInfoSchema>;

export const variantFormSchema = z.object({
  sku: z.string().min(1, "Vui lòng nhập SKU"),
  color: z.string().optional(),
  size: z.string().optional(),
  price: z.coerce.number().positive("Giá phải lớn hơn 0"),
  compareAtPrice: z.coerce.number().optional(),
  stockQuantity: z.coerce.number().int().min(0, "Tồn kho không hợp lệ"),
});

export type VariantFormValues = z.infer<typeof variantFormSchema>;
