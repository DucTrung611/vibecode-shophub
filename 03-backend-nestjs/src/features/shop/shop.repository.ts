import { Injectable } from '@nestjs/common';
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
}

@Injectable()
export class ShopRepository {
  constructor(private readonly prisma: PrismaService) {}

  findByOwnerId(ownerId: number): Promise<ShopEntity | null> {
    return this.prisma.shop.findUnique({ where: { ownerId } });
  }

  findBySlug(slug: string): Promise<ShopEntity | null> {
    return this.prisma.shop.findUnique({ where: { slug } });
  }

  create(data: CreateShopData): Promise<ShopEntity> {
    return this.prisma.shop.create({ data });
  }

  updateByOwnerId(ownerId: number, data: UpdateShopData): Promise<ShopEntity> {
    return this.prisma.shop.update({ where: { ownerId }, data });
  }
}
