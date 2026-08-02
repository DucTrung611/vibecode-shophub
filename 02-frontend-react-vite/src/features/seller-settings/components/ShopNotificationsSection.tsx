import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "../../../shared/components/Button";
import { Input } from "../../../shared/components/Input";
import { useMyShop } from "../hooks/useMyShop";
import { useUpdateShop } from "../hooks/useUpdateShop";
import { shopNotificationSchema, type ShopNotificationFormValues } from "../utils/shop.schema";

export function ShopNotificationsSection() {
  const { data: shop, isLoading } = useMyShop();
  const updateShop = useUpdateShop();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ShopNotificationFormValues>({
    resolver: zodResolver(shopNotificationSchema),
    defaultValues: { notifyOnNewOrder: true, notifyOnLowStock: true },
  });

  useEffect(() => {
    if (shop) {
      reset({
        orderUpdateEmail: shop.notificationSettings?.orderUpdateEmail ?? "",
        notifyOnNewOrder: shop.notificationSettings?.notifyOnNewOrder ?? true,
        notifyOnLowStock: shop.notificationSettings?.notifyOnLowStock ?? true,
      });
    }
  }, [shop, reset]);

  if (isLoading) {
    return <p className="text-sm font-manrope text-neutral-500">Đang tải...</p>;
  }

  return (
    <form
      className="flex max-w-md flex-col gap-4"
      onSubmit={handleSubmit((values) => updateShop.mutate({ notificationSettings: values }))}
    >
      <h2 className="font-sora text-base font-extrabold text-neutral-900">Thông báo</h2>

      <Input
        id="shop-order-update-email"
        label="Email nhận thông báo đơn hàng"
        placeholder="shop@example.com"
        {...register("orderUpdateEmail")}
        error={errors.orderUpdateEmail?.message}
      />

      <label className="flex items-center gap-2 text-sm font-manrope text-neutral-800">
        <input type="checkbox" {...register("notifyOnNewOrder")} />
        Thông báo khi có đơn hàng mới
      </label>
      <label className="flex items-center gap-2 text-sm font-manrope text-neutral-800">
        <input type="checkbox" {...register("notifyOnLowStock")} />
        Thông báo khi sắp hết hàng
      </label>

      <div>
        <Button type="submit" isLoading={updateShop.isPending}>
          Lưu thay đổi
        </Button>
      </div>
    </form>
  );
}
