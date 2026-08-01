import { ApiError } from "../../../shared/types/api-response.types";

const MESSAGES: Record<string, string> = {
  AUTH_004: "Email hoặc mật khẩu không đúng",
  AUTH_005: "Tài khoản chưa được kích hoạt",
  AUTH_006: "Email đã được đăng ký",
  VALIDATION_001: "Thông tin không hợp lệ, vui lòng kiểm tra lại",
};

export function toAuthErrorMessage(error: unknown): string {
  if (error instanceof ApiError) {
    return MESSAGES[error.code] ?? error.message;
  }
  return "Đã có lỗi xảy ra, vui lòng thử lại";
}
