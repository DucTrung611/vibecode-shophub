import { Injectable } from '@nestjs/common';
import type { Prisma } from '../../../generated/prisma/client';
import { PrismaService } from '../../core/database/prisma.service';
import { ShopEntity } from './entities/shop.entity';

export interface CreateShopData {
  ownerId: number;
  name: string;
  slug: string;
  status: 'pending' | 'approved' | 'suspended' | 'rejected';
}

export interface UpdateShopData {
  name?: string;
  description?: string;
  phone?: string;
  email?: string;
  province?: string;
  district?: string;
  ward?: string;
  detailAddress?: string;
  shippingSettings?: Record<string, unknown>;
  paymentSettings?: Record<string, unknown>;
  notificationSettings?: Record<string, unknown>;
}

export interface UpdateShopImagesData {
  logoUrl?: string;
  bannerUrl?: string;
}

export type ShopStatusValue = 'pending' | 'approved' | 'suspended' | 'rejected';

export interface UpdateShopStatusData {
  status: ShopStatusValue;
  rejectionReason?: string | null;
}

@Injectable()
export class ShopRepository {
  constructor(private readonly prisma: PrismaService) {}

  findByOwnerId(ownerId: number): Promise<ShopEntity | null> {
    return this.prisma.shop.findUnique({ where: { ownerId } });
  }

  findById(id: number): Promise<ShopEntity | null> {
    return this.prisma.shop.findUnique({ where: { id } });
  }

  findBySlug(slug: string): Promise<ShopEntity | null> {
    return this.prisma.shop.findUnique({ where: { slug } });
  }

  create(data: CreateShopData): Promise<ShopEntity> {
    return this.prisma.shop.create({ data });
  }

  updateByOwnerId(ownerId: number, data: UpdateShopData): Promise<ShopEntity> {
    return this.prisma.shop.update({
      where: { ownerId },
      data: data as Prisma.ShopUpdateInput,
    });
  }

  updateImagesByOwnerId(
    ownerId: number,
    data: UpdateShopImagesData,
  ): Promise<ShopEntity> {
    return this.prisma.shop.update({ where: { ownerId }, data });
  }

  async findManyByStatus(
    status: ShopStatusValue | undefined,
    page: number,
    limit: number,
  ): Promise<{ items: ShopEntity[]; total: number }> {
    const where = status ? { status } : {};
    const [items, total] = await Promise.all([
      this.prisma.shop.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.shop.count({ where }),
    ]);
    return { items, total };
  }

  updateStatus(id: number, data: UpdateShopStatusData): Promise<ShopEntity> {
    return this.prisma.shop.update({
      where: { id },
      data: {
        status: data.status,
        rejectionReason:
          data.status === 'rejected' ? data.rejectionReason : null,
      },
    });
  }

  async countByStatus(): Promise<Record<ShopStatusValue, number>> {
    const grouped = await this.prisma.shop.groupBy({
      by: ['status'],
      _count: { _all: true },
    });
    const result: Record<ShopStatusValue, number> = {
      pending: 0,
      approved: 0,
      suspended: 0,
      rejected: 0,
    };
    for (const row of grouped) {
      result[row.status] = row._count._all;
    }
    return result;
  }

  listRecent(limit: number): Promise<ShopEntity[]> {
    return this.prisma.shop.findMany({
      orderBy: { createdAt: 'desc' },
      take: limit,
    });
  }
}
