import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../core/database/prisma.service';
import {
  WISHLIST_ITEM_INCLUDE,
  WishlistItemDetail,
} from './entities/wishlist.entity';

@Injectable()
export class WishlistRepository {
  constructor(private readonly prisma: PrismaService) {}

  findByUser(userId: number): Promise<WishlistItemDetail[]> {
    return this.prisma.wishlist.findMany({
      where: { userId },
      include: WISHLIST_ITEM_INCLUDE,
      orderBy: { createdAt: 'desc' },
    });
  }

  findOne(userId: number, productId: number) {
    return this.prisma.wishlist.findUnique({
      where: { userId_productId: { userId, productId } },
    });
  }

  create(userId: number, productId: number) {
    return this.prisma.wishlist.create({ data: { userId, productId } });
  }

  delete(userId: number, productId: number) {
    return this.prisma.wishlist.delete({
      where: { userId_productId: { userId, productId } },
    });
  }
}
