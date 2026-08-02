export type UserRole = "buyer" | "seller" | "admin";

export interface AdminUser {
  id: number;
  email: string;
  phone: string | null;
  fullName: string;
  role: UserRole;
  isActive: boolean;
  createdAt: string;
}

export interface ListUsersParams {
  page: number;
  limit: number;
  role?: UserRole;
  search?: string;
}
