"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { GoogleLogin } from "@react-oauth/google";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { Button } from "../../../shared/components/Button";
import { Input } from "../../../shared/components/Input";
import { useGoogleLoginMutation } from "../hooks/useGoogleLoginMutation";
import { useLogin } from "../hooks/useLogin";
import { loginSchema, type LoginFormValues } from "../utils/auth.schema";
import { toAuthErrorMessage } from "../utils/error-message.util";

export function LoginForm() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({ resolver: zodResolver(loginSchema) });
  const loginMutation = useLogin();
  const googleLoginMutation = useGoogleLoginMutation();

  const onSubmit = (values: LoginFormValues) => {
    loginMutation.mutate(values);
  };

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-2xl font-bold font-sora text-neutral-900">
          Chào mừng trở lại
        </h2>
        <p className="mt-1 text-sm text-neutral-500 font-manrope">
          Đăng nhập để tiếp tục mua sắm
        </p>
      </div>

      <form
        onSubmit={handleSubmit(onSubmit)}
        noValidate
        className="flex flex-col gap-4"
      >
        {/* noValidate: let zod own all validation messages — native HTML5 constraint
            validation (e.g. type="email") otherwise silently blocks the submit event
            before our handler runs, so our Vietnamese error copy never shows. */}
        {loginMutation.isError && (
          <p className="rounded-lg bg-error-tint px-3 py-2 text-sm text-error" role="alert">
            {toAuthErrorMessage(loginMutation.error)}
          </p>
        )}

        <Input
          id="email"
          type="email"
          label="Email"
          placeholder="you@example.com"
          error={errors.email?.message}
          {...register("email")}
        />

        <div>
          <Input
            id="password"
            type="password"
            label="Mật khẩu"
            error={errors.password?.message}
            {...register("password")}
          />
          <div className="mt-2 text-right">
            <Link
              href="/forgot-password"
              className="text-xs font-manrope text-hub-600 hover:underline"
            >
              Quên mật khẩu?
            </Link>
          </div>
        </div>

        <Button type="submit" isLoading={loginMutation.isPending}>
          Đăng nhập
        </Button>
      </form>

      <div className="flex items-center gap-2">
        <div className="h-px flex-1 bg-neutral-100" />
        <span className="text-[11px] text-neutral-400 font-manrope">HOẶC</span>
        <div className="h-px flex-1 bg-neutral-100" />
      </div>

      {googleLoginMutation.isError && (
        <p className="rounded-lg bg-error-tint px-3 py-2 text-sm text-error" role="alert">
          {toAuthErrorMessage(googleLoginMutation.error)}
        </p>
      )}

      <div className="flex justify-center">
        <GoogleLogin
          onSuccess={(credentialResponse) => {
            if (credentialResponse.credential) {
              googleLoginMutation.mutate(credentialResponse.credential);
            }
          }}
          theme="outline"
          shape="rectangular"
          size="large"
          width="100%"
        />
      </div>

      <p className="text-center text-sm text-neutral-500 font-manrope">
        Chưa có tài khoản?{" "}
        <Link href="/register" className="font-bold text-hub-600 hover:underline">
          Đăng ký ngay
        </Link>
      </p>
    </div>
  );
}
