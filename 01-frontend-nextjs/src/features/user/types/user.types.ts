export interface Profile {
  id: number;
  email: string;
  phone: string | null;
  fullName: string;
  role: "buyer" | "seller" | "admin";
  isActive: boolean;
  createdAt: string;
}

export interface UpdateProfileInput {
  fullName?: string;
  phone?: string;
}

export interface Address {
  id: number;
  userId: number;
  recipientName: string;
  phone: string;
  province: string;
  district: string;
  ward: string;
  detailAddress: string;
  isDefault: boolean;
}

export interface CreateAddressInput {
  recipientName: string;
  phone: string;
  province: string;
  district: string;
  ward: string;
  detailAddress: string;
  isDefault?: boolean;
}
