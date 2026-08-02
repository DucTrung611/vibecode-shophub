import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "../../../shared/components/Button";
import { Input } from "../../../shared/components/Input";
import { useMyShop } from "../hooks/useMyShop";
import { useUpdateShop } from "../hooks/useUpdateShop";
import { shopContactSchema, type ShopContactFormValues } from "../utils/shop.schema";

export function ShopContactSection() {
  const { data: shop, isLoading } = useMyShop();
  const updateShop = useUpdateShop();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ShopContactFormValues>({
    resolver: zodResolver(shopContactSchema),
    defaultValues: {},
  });

  useEffect(() => {
    if (shop) {
      reset({
        phone: shop.phone ?? "",
        email: shop.email ?? "",
        province: shop.province ?? "",
        district: shop.district ?? "",
        ward: shop.ward ?? "",
        detailAddress: shop.detailAddress ?? "",
      });
    }
  }, [shop, reset]);

  if (isLoading) {
    return <p className="text-sm font-manrope text-neutral-500">Đang tải...</p>;
  }

  return (
    <form
      className="flex max-w-md flex-col gap-4"
      onSubmit={handleSubmit((values) => updateShop.mutate(values))}
    >
      <h2 className="font-sora text-base font-extrabold text-neutral-900">Liên hệ & địa chỉ</h2>

      <Input
        id="shop-phone"
        label="Số điện thoại"
        placeholder="0901234567"
        {...register("phone")}
        error={errors.phone?.message}
      />
      <Input
        id="shop-email"
        label="Email liên hệ"
        placeholder="shop@example.com"
        {...register("email")}
        error={errors.email?.message}
      />
      <div className="grid grid-cols-3 gap-3">
        <Input id="shop-province" label="Tỉnh/Thành phố" {...register("province")} />
        <Input id="shop-district" label="Quận/Huyện" {...register("district")} />
        <Input id="shop-ward" label="Phường/Xã" {...register("ward")} />
      </div>
      <Input
        id="shop-detail-address"
        label="Địa chỉ lấy hàng"
        placeholder="Số nhà, đường"
        {...register("detailAddress")}
      />

      <div>
        <Button type="submit" isLoading={updateShop.isPending}>
          Lưu thay đổi
        </Button>
      </div>
    </form>
  );
}
