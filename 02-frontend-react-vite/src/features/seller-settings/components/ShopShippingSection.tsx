import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "../../../shared/components/Button";
import { Input } from "../../../shared/components/Input";
import { useMyShop } from "../hooks/useMyShop";
import { useUpdateShop } from "../hooks/useUpdateShop";
import { shopShippingSchema, type ShopShippingFormValues } from "../utils/shop.schema";

export function ShopShippingSection() {
  const { data: shop, isLoading } = useMyShop();
  const updateShop = useUpdateShop();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ShopShippingFormValues>({
    resolver: zodResolver(shopShippingSchema),
    defaultValues: {},
  });

  useEffect(() => {
    if (shop) {
      reset({
        defaultCarrier: shop.shippingSettings?.defaultCarrier ?? "",
        baseShippingFee: shop.shippingSettings?.baseShippingFee ?? undefined,
      });
    }
  }, [shop, reset]);

  if (isLoading) {
    return <p className="text-sm font-manrope text-neutral-500">Đang tải...</p>;
  }

  return (
    <form
      className="flex max-w-md flex-col gap-4"
      onSubmit={handleSubmit((values) =>
        updateShop.mutate({
          shippingSettings: {
            defaultCarrier: values.defaultCarrier,
            baseShippingFee: values.baseShippingFee,
          },
        }),
      )}
    >
      <h2 className="font-sora text-base font-extrabold text-neutral-900">Vận chuyển</h2>

      <Input
        id="shop-default-carrier"
        label="Đơn vị vận chuyển mặc định"
        placeholder="GHN"
        {...register("defaultCarrier")}
        error={errors.defaultCarrier?.message}
      />
      <Input
        id="shop-base-shipping-fee"
        label="Phí vận chuyển cơ bản (₫)"
        type="number"
        placeholder="20000"
        {...register("baseShippingFee")}
        error={errors.baseShippingFee?.message}
      />

      <div>
        <Button type="submit" isLoading={updateShop.isPending}>
          Lưu thay đổi
        </Button>
      </div>
    </form>
  );
}
