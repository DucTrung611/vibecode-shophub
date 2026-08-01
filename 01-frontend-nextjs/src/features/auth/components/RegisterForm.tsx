"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { Button } from "../../../shared/components/Button";
import { Checkbox } from "../../../shared/components/Checkbox";
import { Input } from "../../../shared/components/Input";
import { useRegister } from "../hooks/useRegister";
import { registerSchema, type RegisterFormValues } from "../utils/auth.schema";
import { toAuthErrorMessage } from "../utils/error-message.util";

export function RegisterForm() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormValues>({ resolver: zodResolver(registerSchema) });
  const registerMutation = useRegister();

  const onSubmit = (values: RegisterFormValues) => {
    registerMutation.mutate(values);
  };

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-2xl font-bold font-sora text-neutral-900">
          Tạo tài khoản
        </h2>
        <p className="mt-1 text-sm text-neutral-500 font-manrope">
          Tham gia ShopHub để mua sắm dễ dàng hơn
        </p>
      </div>

      <form
        onSubmit={handleSubmit(onSubmit)}
        noValidate
        className="flex flex-col gap-4"
      >
        {registerMutation.isError && (
          <p className="rounded-lg bg-error-tint px-3 py-2 text-sm text-error" role="alert">
            {toAuthErrorMessage(registerMutation.error)}
          </p>
        )}

        <Input
          id="fullName"
          label="Họ và tên"
          error={errors.fullName?.message}
          {...register("fullName")}
        />

        <Input
          id="email"
          type="email"
          label="Email"
          placeholder="you@example.com"
          error={errors.email?.message}
          {...register("email")}
        />

        <Input
          id="phone"
          type="tel"
          label="Số điện thoại"
          error={errors.phone?.message}
          {...register("phone")}
        />

        <Input
          id="password"
          type="password"
          label="Mật khẩu"
          placeholder="Tối thiểu 8 ký tự"
          error={errors.password?.message}
          {...register("password")}
        />

        <Checkbox
          id="agreeTerms"
          error={errors.agreeTerms?.message}
          {...register("agreeTerms")}
          label={
            <>
              Tôi đồng ý với{" "}
              <Link href="#" className="text-hub-600 hover:underline">
                Điều khoản dịch vụ
              </Link>{" "}
              và{" "}
              <Link href="#" className="text-hub-600 hover:underline">
                Chính sách bảo mật
              </Link>
            </>
          }
        />

        <Button type="submit" isLoading={registerMutation.isPending}>
          Đăng ký
        </Button>
      </form>

      <p className="text-center text-sm text-neutral-500 font-manrope">
        Đã có tài khoản?{" "}
        <Link href="/login" className="font-bold text-hub-600 hover:underline">
          Đăng nhập
        </Link>
      </p>
    </div>
  );
}
