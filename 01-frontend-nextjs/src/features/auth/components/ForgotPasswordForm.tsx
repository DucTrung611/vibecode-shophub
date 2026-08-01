"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { Button } from "../../../shared/components/Button";
import { Input } from "../../../shared/components/Input";
import {
  forgotPasswordSchema,
  type ForgotPasswordFormValues,
} from "../utils/auth.schema";

export function ForgotPasswordForm() {
  const [submitted, setSubmitted] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordFormValues>({
    resolver: zodResolver(forgotPasswordSchema),
  });

  const onSubmit = () => {
    // Backend has no password-reset endpoint yet (not in API_SPEC.md) —
    // this validates client-side only and surfaces a "coming soon" notice.
    setSubmitted(true);
  };

  return (
    <div className="flex flex-col gap-6">
      <Link href="/login" className="text-sm font-manrope text-neutral-500 hover:text-hub-600">
        ← Quay lại
      </Link>

      <div>
        <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-hub-50 text-2xl">
          🔑
        </div>
        <h2 className="text-2xl font-bold font-sora text-neutral-900">
          Quên mật khẩu?
        </h2>
        <p className="mt-1 text-sm text-neutral-500 font-manrope">
          Nhập email của bạn, chúng tôi sẽ gửi liên kết để đặt lại mật khẩu.
        </p>
      </div>

      {submitted ? (
        <p className="rounded-lg bg-hub-50 px-3 py-2 text-sm text-hub-700" role="status">
          Tính năng đặt lại mật khẩu sẽ sớm được hỗ trợ.
        </p>
      ) : (
        <form
          onSubmit={handleSubmit(onSubmit)}
          noValidate
          className="flex flex-col gap-4"
        >
          <Input
            id="email"
            type="email"
            label="Email"
            placeholder="you@example.com"
            error={errors.email?.message}
            {...register("email")}
          />
          <Button type="submit">Gửi liên kết đặt lại</Button>
        </form>
      )}
    </div>
  );
}
