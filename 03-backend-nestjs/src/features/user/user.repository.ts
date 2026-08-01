import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../core/database/prisma.service';
import { AddressEntity } from './entities/address.entity';
import { UserEntity } from './entities/user.entity';

export interface CreateUserData {
  email: string;
  phone?: string;
  passwordHash: string;
  fullName: string;
  role: 'buyer' | 'seller' | 'admin';
}

export interface CreateAddressData {
  recipientName: string;
  phone: string;
  province: string;
  district: string;
  ward: string;
  detailAddress: string;
  isDefault?: boolean;
}

export interface UpdateAddressData {
  recipientName?: string;
  phone?: string;
  province?: string;
  district?: string;
  ward?: string;
  detailAddress?: string;
  isDefault?: boolean;
}

@Injectable()
export class UserRepository {
  constructor(private readonly prisma: PrismaService) {}

  findByEmail(email: string): Promise<UserEntity | null> {
    return this.prisma.user.findUnique({ where: { email } });
  }

  findById(id: number): Promise<UserEntity | null> {
    return this.prisma.user.findUnique({ where: { id } });
  }

  create(data: CreateUserData): Promise<UserEntity> {
    return this.prisma.user.create({ data });
  }

  updateRole(
    id: number,
    role: 'buyer' | 'seller' | 'admin',
  ): Promise<UserEntity> {
    return this.prisma.user.update({ where: { id }, data: { role } });
  }

  updateProfile(
    id: number,
    data: { fullName?: string; phone?: string },
  ): Promise<UserEntity> {
    return this.prisma.user.update({ where: { id }, data });
  }

  findAddressesByUser(userId: number): Promise<AddressEntity[]> {
    return this.prisma.address.findMany({
      where: { userId },
      orderBy: { isDefault: 'desc' },
    });
  }

  findAddressById(id: number): Promise<AddressEntity | null> {
    return this.prisma.address.findUnique({ where: { id } });
  }

  async findAddressByIdForUser(
    userId: number,
    addressId: number,
  ): Promise<AddressEntity | null> {
    const address = await this.prisma.address.findUnique({
      where: { id: addressId },
    });
    if (!address || address.userId !== userId) return null;
    return address;
  }

  createAddress(
    userId: number,
    data: CreateAddressData,
  ): Promise<AddressEntity> {
    return this.prisma.address.create({ data: { userId, ...data } });
  }

  updateAddress(id: number, data: UpdateAddressData): Promise<AddressEntity> {
    return this.prisma.address.update({ where: { id }, data });
  }

  deleteAddress(id: number): Promise<AddressEntity> {
    return this.prisma.address.delete({ where: { id } });
  }
}
