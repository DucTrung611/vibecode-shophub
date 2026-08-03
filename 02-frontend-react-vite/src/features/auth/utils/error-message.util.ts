import { ApiError } from "../../../shared/types/api-response.types";
import { WrongRoleError } from "./wrong-role.error";

const MESSAGES: Record<string, string> = {
  AUTH_004: "Email hoặc mật khẩu không đúng",
  AUTH_005: "Tài khoản chưa được kích hoạt",
  AUTH_007: "Không thể xác thực với Google, vui lòng thử lại",
  AUTH_008: "Email Google chưa được xác minh",
};

export function toAuthErrorMessage(error: unknown): string {
  if (error instanceof WrongRoleError) {
    return error.message;
  }
  if (error instanceof ApiError) {
    return MESSAGES[error.code] ?? error.message;
  }
  return "Đã có lỗi xảy ra, vui lòng thử lại";
}
