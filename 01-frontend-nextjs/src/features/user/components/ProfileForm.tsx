"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Button } from "../../../shared/components/Button";
import { Input } from "../../../shared/components/Input";
import { useUpdateProfile } from "../hooks/useUpdateProfile";
import type { Profile } from "../types/user.types";
import { profileSchema, type ProfileFormValues } from "../utils/profile.schema";

interface ProfileFormProps {
  profile: Profile;
}

export function ProfileForm({ profile }: ProfileFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: { fullName: profile.fullName, phone: profile.phone ?? "" },
  });
  const updateProfile = useUpdateProfile();

  const onSubmit = (values: ProfileFormValues) => {
    updateProfile.mutate(values);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-4">
      <Input
        id="fullName"
        label="Họ và tên"
        autoComplete="name"
        error={errors.fullName?.message}
        {...register("fullName")}
      />
      <Input
        id="email"
        label="Email"
        autoComplete="email"
        value={profile.email}
        disabled
        readOnly
      />
      <Input
        id="phone"
        label="Số điện thoại"
        autoComplete="tel"
        error={errors.phone?.message}
        {...register("phone")}
      />

      {updateProfile.isSuccess && (
        <p className="text-xs font-manrope text-success">Đã lưu thay đổi</p>
      )}

      <Button type="submit" isLoading={updateProfile.isPending}>
        Lưu thay đổi
      </Button>
    </form>
  );
}
