import { ApiError } from "../../../shared/types/api-response.types";

const MESSAGES: Record<string, string> = {
  AUTH_004: "Email hoặc mật khẩu không đúng",
  AUTH_005: "Tài khoản chưa được kích hoạt",
  AUTH_006: "Email đã được đăng ký",
  AUTH_007: "Không thể xác thực với Google, vui lòng thử lại",
  AUTH_008: "Email Google chưa được xác minh",
  AUTH_009: "Tài khoản này đăng nhập bằng Google, vui lòng dùng nút Google bên dưới",
  VALIDATION_001: "Thông tin không hợp lệ, vui lòng kiểm tra lại",
};

export function toAuthErrorMessage(error: unknown): string {
  if (error instanceof ApiError) {
    return MESSAGES[error.code] ?? error.message;
  }
  return "Đã có lỗi xảy ra, vui lòng thử lại";
}
