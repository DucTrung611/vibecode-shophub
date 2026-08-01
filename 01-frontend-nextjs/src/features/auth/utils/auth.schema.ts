import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().min(1, "Vui lòng nhập email").email("Email không hợp lệ"),
  password: z.string().min(1, "Vui lòng nhập mật khẩu"),
});

export type LoginFormValues = z.infer<typeof loginSchema>;

export const registerSchema = z.object({
  fullName: z.string().min(1, "Vui lòng nhập họ và tên"),
  email: z.string().min(1, "Vui lòng nhập email").email("Email không hợp lệ"),
  phone: z.string().optional(),
  password: z.string().min(8, "Mật khẩu tối thiểu 8 ký tự"),
  agreeTerms: z.literal(true, {
    message: "Bạn cần đồng ý với Điều khoản dịch vụ và Chính sách bảo mật",
  }),
});

export type RegisterFormValues = z.infer<typeof registerSchema>;

export const forgotPasswordSchema = z.object({
  email: z.string().min(1, "Vui lòng nhập email").email("Email không hợp lệ"),
});

export type ForgotPasswordFormValues = z.infer<typeof forgotPasswordSchema>;
