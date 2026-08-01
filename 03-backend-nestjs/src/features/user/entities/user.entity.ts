export interface UserEntity {
  id: number;
  email: string;
  phone: string | null;
  passwordHash: string;
  fullName: string;
  role: 'buyer' | 'seller' | 'admin';
  isActive: boolean;
  emailVerifiedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}
