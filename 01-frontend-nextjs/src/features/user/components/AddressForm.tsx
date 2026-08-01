"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Button } from "../../../shared/components/Button";
import { Input } from "../../../shared/components/Input";
import { useCreateAddress } from "../hooks/useCreateAddress";
import { addressSchema, type AddressFormValues } from "../utils/address.schema";

interface AddressFormProps {
  onCreated: (addressId: number) => void;
}

export function AddressForm({ onCreated }: AddressFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<AddressFormValues>({ resolver: zodResolver(addressSchema) });
  const createAddress = useCreateAddress();

  const onSubmit = (values: AddressFormValues) => {
    createAddress.mutate(values, {
      onSuccess: (address) => onCreated(address.id),
    });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-3">
      <Input
        id="recipientName"
        label="Họ và tên người nhận"
        autoComplete="name"
        error={errors.recipientName?.message}
        {...register("recipientName")}
      />
      <Input
        id="phone"
        label="Số điện thoại"
        autoComplete="tel"
        error={errors.phone?.message}
        {...register("phone")}
      />
      <div className="grid grid-cols-3 gap-2">
        <Input
          id="province"
          label="Tỉnh/Thành"
          autoComplete="address-level1"
          error={errors.province?.message}
          {...register("province")}
        />
        <Input
          id="district"
          label="Quận/Huyện"
          autoComplete="address-level2"
          error={errors.district?.message}
          {...register("district")}
        />
        <Input
          id="ward"
          label="Phường/Xã"
          autoComplete="address-level3"
          error={errors.ward?.message}
          {...register("ward")}
        />
      </div>
      <Input
        id="detailAddress"
        label="Địa chỉ chi tiết"
        autoComplete="street-address"
        error={errors.detailAddress?.message}
        {...register("detailAddress")}
      />
      <Button type="submit" isLoading={createAddress.isPending}>
        Lưu địa chỉ
      </Button>
    </form>
  );
}
