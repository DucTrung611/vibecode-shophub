export interface AddressEntity {
  id: number;
  userId: number;
  recipientName: string;
  phone: string;
  province: string;
  district: string;
  ward: string;
  detailAddress: string;
  isDefault: boolean;
  createdAt: Date;
  updatedAt: Date;
}
