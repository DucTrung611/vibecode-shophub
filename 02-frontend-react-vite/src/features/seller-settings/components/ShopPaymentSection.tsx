import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "../../../shared/components/Button";
import { Input } from "../../../shared/components/Input";
import { useMyShop } from "../hooks/useMyShop";
import { useUpdateShop } from "../hooks/useUpdateShop";
import { shopPaymentSchema, type ShopPaymentFormValues } from "../utils/shop.schema";

export function ShopPaymentSection() {
  const { data: shop, isLoading } = useMyShop();
  const updateShop = useUpdateShop();

  const {
    register,
    handleSubmit,
    reset,
  } = useForm<ShopPaymentFormValues>({
    resolver: zodResolver(shopPaymentSchema),
    defaultValues: {},
  });

  useEffect(() => {
    if (shop) {
      reset({
        bankName: shop.paymentSettings?.bankName ?? "",
        bankAccountNumber: shop.paymentSettings?.bankAccountNumber ?? "",
        bankAccountHolder: shop.paymentSettings?.bankAccountHolder ?? "",
      });
    }
  }, [shop, reset]);

  if (isLoading) {
    return <p className="text-sm font-manrope text-neutral-500">Đang tải...</p>;
  }

  return (
    <form
      className="flex max-w-md flex-col gap-4"
      onSubmit={handleSubmit((values) => updateShop.mutate({ paymentSettings: values }))}
    >
      <h2 className="font-sora text-base font-extrabold text-neutral-900">Thanh toán</h2>

      <Input id="shop-bank-name" label="Tên ngân hàng" placeholder="Vietcombank" {...register("bankName")} />
      <Input
        id="shop-bank-account-number"
        label="Số tài khoản ngân hàng"
        placeholder="0123456789"
        {...register("bankAccountNumber")}
      />
      <Input
        id="shop-bank-account-holder"
        label="Chủ tài khoản"
        placeholder="NGUYEN VAN A"
        {...register("bankAccountHolder")}
      />

      <div>
        <Button type="submit" isLoading={updateShop.isPending}>
          Lưu thay đổi
        </Button>
      </div>
    </form>
  );
}
