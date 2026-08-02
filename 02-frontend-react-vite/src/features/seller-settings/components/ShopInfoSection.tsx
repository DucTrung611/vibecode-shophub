import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "../../../shared/components/Button";
import { Input } from "../../../shared/components/Input";
import { useMyShop } from "../hooks/useMyShop";
import { useUpdateShop } from "../hooks/useUpdateShop";
import { shopInfoSchema, type ShopInfoFormValues } from "../utils/shop.schema";

export function ShopInfoSection() {
  const { data: shop, isLoading } = useMyShop();
  const updateShop = useUpdateShop();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ShopInfoFormValues>({
    resolver: zodResolver(shopInfoSchema),
    defaultValues: { name: "" },
  });

  useEffect(() => {
    if (shop) {
      reset({ name: shop.name });
    }
  }, [shop, reset]);

  if (isLoading) {
    return <p className="text-sm font-manrope text-neutral-500">Đang tải thông tin shop...</p>;
  }

  return (
    <form
      className="flex max-w-md flex-col gap-4"
      onSubmit={handleSubmit((values) => updateShop.mutate(values))}
    >
      <Input
        id="shop-name"
        label="Tên shop"
        {...register("name")}
        error={errors.name?.message}
      />

      <div className="flex flex-col gap-1.5">
        <span className="text-xs font-bold font-manrope text-neutral-700">Đường dẫn shop</span>
        <div className="rounded-[9px] border border-neutral-200 bg-neutral-50 px-3.5 py-3 text-sm font-manrope text-neutral-500">
          /{shop?.slug}
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <span className="text-xs font-bold font-manrope text-neutral-700">
          Logo / Ảnh bìa shop
        </span>
        <div className="flex items-center gap-3 rounded-[9px] border border-dashed border-neutral-300 bg-neutral-50 px-3.5 py-4 text-xs font-manrope text-neutral-400">
          Tải ảnh lên — Sắp ra mắt
        </div>
      </div>

      <div>
        <Button type="submit" isLoading={updateShop.isPending}>
          Lưu thay đổi
        </Button>
      </div>
    </form>
  );
}
