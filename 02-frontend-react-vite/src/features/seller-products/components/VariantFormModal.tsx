import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "../../../shared/components/Button";
import { Input } from "../../../shared/components/Input";
import { Modal } from "../../../shared/components/Modal";
import type { ProductVariant } from "../types/product.types";
import { variantFormSchema, type VariantFormValues } from "../utils/product.schema";

interface VariantFormModalProps {
  open: boolean;
  onClose: () => void;
  variant?: ProductVariant;
  onSubmit: (values: VariantFormValues) => void;
  isSubmitting?: boolean;
}

export function VariantFormModal({
  open,
  onClose,
  variant,
  onSubmit,
  isSubmitting,
}: VariantFormModalProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<VariantFormValues>({
    resolver: zodResolver(variantFormSchema),
    values: variant
      ? {
          sku: variant.sku,
          color: variant.attributes?.color ?? "",
          size: variant.attributes?.size ?? "",
          price: variant.price,
          compareAtPrice: variant.compareAtPrice ?? undefined,
          stockQuantity: variant.stockQuantity,
        }
      : { sku: "", color: "", size: "", price: 0, stockQuantity: 0 },
  });

  return (
    <Modal open={open} onClose={onClose} title={variant ? "Sửa phân loại" : "Thêm phân loại"}>
      <form
        className="flex flex-col gap-4"
        onSubmit={handleSubmit((values) => {
          onSubmit(values);
        })}
      >
        <Input
          label="SKU"
          disabled={!!variant}
          {...register("sku")}
          error={errors.sku?.message}
        />
        <div className="grid grid-cols-2 gap-3">
          <Input label="Màu sắc" {...register("color")} />
          <Input label="Kích thước" {...register("size")} />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Input
            label="Giá bán"
            type="number"
            {...register("price")}
            error={errors.price?.message}
          />
          <Input label="Giá gốc (so sánh)" type="number" {...register("compareAtPrice")} />
        </div>
        <Input
          label="Tồn kho"
          type="number"
          {...register("stockQuantity")}
          error={errors.stockQuantity?.message}
        />
        <div className="flex justify-end gap-2">
          <div className="w-fit">
            <Button type="button" variant="outline" onClick={onClose}>
              Hủy
            </Button>
          </div>
          <div className="w-fit">
            <Button type="submit" isLoading={isSubmitting}>
              {variant ? "Lưu" : "Thêm"}
            </Button>
          </div>
        </div>
      </form>
    </Modal>
  );
}
