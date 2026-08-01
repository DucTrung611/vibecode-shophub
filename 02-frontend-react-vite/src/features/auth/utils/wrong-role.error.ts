export class WrongRoleError extends Error {
  constructor() {
    super("Tài khoản này không có quyền truy cập Seller Center / Admin Panel");
  }
}
