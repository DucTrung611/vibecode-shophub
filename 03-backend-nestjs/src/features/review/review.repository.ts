import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../core/database/prisma.service';
import {
  REVIEW_WITH_PRODUCT_OWNER_INCLUDE,
  ReviewWithProductOwner,
} from './entities/review.entity';

export interface CreateReviewData {
  productId: number;
  orderItemId: number;
  userId: number;
  rating: number;
  comment?: string;
}

@Injectable()
export class ReviewRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findByProduct(productId: number, page: number, limit: number) {
    const where = { productId };
    const [items, total] = await Promise.all([
      this.prisma.review.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.review.count({ where }),
    ]);
    return { items, total };
  }

  existsForOrderItem(orderItemId: number) {
    return this.prisma.review.findUnique({ where: { orderItemId } });
  }

  create(data: CreateReviewData) {
    return this.prisma.review.create({ data });
  }

  addSellerReply(reviewId: number, reply: string) {
    return this.prisma.review.update({
      where: { id: reviewId },
      data: { sellerReply: reply },
    });
  }

  async averageRatingForProduct(productId: number): Promise<number | null> {
    const result = await this.prisma.review.aggregate({
      where: { productId },
      _avg: { rating: true },
    });
    return result._avg.rating;
  }

  findWithProductShopOwner(
    reviewId: number,
  ): Promise<ReviewWithProductOwner | null> {
    return this.prisma.review.findUnique({
      where: { id: reviewId },
      include: REVIEW_WITH_PRODUCT_OWNER_INCLUDE,
    });
  }
}
