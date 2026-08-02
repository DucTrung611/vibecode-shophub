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

  async findMany(filters: {
    page: number;
    limit: number;
    role?: 'buyer' | 'seller' | 'admin';
    search?: string;
  }): Promise<{ items: UserEntity[]; total: number }> {
    const where = {
      ...(filters.role ? { role: filters.role } : {}),
      ...(filters.search
        ? {
            OR: [
              {
                fullName: {
                  contains: filters.search,
                  mode: 'insensitive' as const,
                },
              },
              {
                email: {
                  contains: filters.search,
                  mode: 'insensitive' as const,
                },
              },
            ],
          }
        : {}),
    };
    const [items, total] = await Promise.all([
      this.prisma.user.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (filters.page - 1) * filters.limit,
        take: filters.limit,
      }),
      this.prisma.user.count({ where }),
    ]);
    return { items, total };
  }

  updateActiveStatus(id: number, isActive: boolean): Promise<UserEntity> {
    return this.prisma.user.update({ where: { id }, data: { isActive } });
  }

  countTotal(): Promise<number> {
    return this.prisma.user.count();
  }

  async countWeeklySignups(
    weeks: number,
  ): Promise<{ label: string; value: number }[]> {
    const since = new Date();
    since.setDate(since.getDate() - weeks * 7);
    const users = await this.prisma.user.findMany({
      where: { createdAt: { gte: since } },
      select: { createdAt: true },
    });

    const buckets = new Map<number, number>();
    for (let i = 0; i < weeks; i++) buckets.set(i, 0);
    const now = Date.now();
    for (const u of users) {
      const weeksAgo = Math.floor(
        (now - u.createdAt.getTime()) / (7 * 24 * 60 * 60 * 1000),
      );
      const bucket = weeks - 1 - weeksAgo;
      if (bucket >= 0 && bucket < weeks) {
        buckets.set(bucket, (buckets.get(bucket) ?? 0) + 1);
      }
    }
    return Array.from(buckets.entries()).map(([i, value]) => ({
      label: `Tuần ${i + 1}`,
      value,
    }));
  }
}
