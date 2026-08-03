export interface UserEntity {
  id: number;
  email: string;
  phone: string | null;
  passwordHash: string | null;
  googleId: string | null;
  fullName: string;
  role: 'buyer' | 'seller' | 'admin';
  isActive: boolean;
  emailVerifiedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}
