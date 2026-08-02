import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "../../../shared/components/Button";
import { Input } from "../../../shared/components/Input";
import { useCategories } from "../hooks/useCategories";
import type { ProductStatus } from "../types/product.types";
import { flattenCategories } from "../utils/flatten-categories";
import { productBasicInfoSchema, type ProductBasicInfoValues } from "../utils/product.schema";

interface ProductBasicInfoFormProps {
  defaultValues?: { name: string; categoryId: number };
  status?: ProductStatus;
  onStatusChange?: (status: ProductStatus) => void;
  onSubmit: (values: ProductBasicInfoValues) => void;
  isSubmitting?: boolean;
  submitLabel: string;
}

const STATUS_OPTIONS: { value: ProductStatus; label: string }[] = [
  { value: "draft", label: "Nháp" },
  { value: "active", label: "Đang bán" },
  { value: "inactive", label: "Đã ẩn" },
];

export function ProductBasicInfoForm({
  defaultValues,
  status,
  onStatusChange,
  onSubmit,
  isSubmitting,
  submitLabel,
}: ProductBasicInfoFormProps) {
  const { data: categories } = useCategories();
  const flatCategories = flattenCategories(categories ?? []);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ProductBasicInfoValues>({
    resolver: zodResolver(productBasicInfoSchema),
    defaultValues: defaultValues ?? { name: "", categoryId: 0 },
  });

  useEffect(() => {
    if (defaultValues) {
      reset(defaultValues);
    }
  }, [defaultValues, reset]);

  return (
    <form className="flex flex-col gap-4" onSubmit={handleSubmit(onSubmit)}>
      <Input
        id="product-name"
        label="Tên sản phẩm"
        {...register("name")}
        error={errors.name?.message}
      />

      <div className="flex flex-col gap-1.5">
        <label htmlFor="product-category" className="text-xs font-bold font-manrope text-neutral-700">
          Danh mục
        </label>
        <select
          id="product-category"
          {...register("categoryId")}
          className="rounded-[9px] border border-neutral-200 px-3.5 py-3 text-sm font-manrope text-neutral-900 outline-none focus:border-hub-500"
        >
          <option value={0}>Chọn danh mục</option>
          {flatCategories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.label}
            </option>
          ))}
        </select>
        {errors.categoryId?.message && (
          <p className="text-xs text-error">{errors.categoryId.message}</p>
        )}
      </div>

      {status && onStatusChange && (
        <div className="flex flex-col gap-2">
          <span className="text-xs font-bold font-manrope text-neutral-700">Trạng thái</span>
          <div className="flex gap-4">
            {STATUS_OPTIONS.map((option) => (
              <label
                key={option.value}
                className="flex items-center gap-1.5 text-sm font-manrope text-neutral-800"
              >
                <input
                  type="radio"
                  name="product-status"
                  checked={status === option.value}
                  onChange={() => onStatusChange(option.value)}
                />
                {option.label}
              </label>
            ))}
          </div>
        </div>
      )}

      <div>
        <Button type="submit" isLoading={isSubmitting}>
          {submitLabel}
        </Button>
      </div>
    </form>
  );
}
