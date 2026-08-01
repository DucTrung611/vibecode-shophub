import { HttpStatus, Inject, Injectable } from '@nestjs/common';
import { AppException } from '../../shared/exceptions/app.exception';
import { CATALOG_PORT } from '../catalog/catalog.port';
import type { CatalogPort } from '../catalog/catalog.port';
import { ORDER_PORT } from '../order/order.port';
import type { OrderPort } from '../order/order.port';
import { CreateReviewDto } from './dto/create-review.dto';
import { ReviewRepository } from './review.repository';

@Injectable()
export class ReviewService {
  constructor(
    private readonly reviewRepository: ReviewRepository,
    @Inject(ORDER_PORT) private readonly orderPort: OrderPort,
    @Inject(CATALOG_PORT) private readonly catalogPort: CatalogPort,
  ) {}

  async create(userId: number, dto: CreateReviewDto) {
    const orderItem = await this.orderPort.findOrderItemForReview(
      dto.orderItemId,
      userId,
    );
    if (!orderItem) {
      throw new AppException(
        'COMMON_404',
        'Order item not found or not yours',
        HttpStatus.NOT_FOUND,
      );
    }

    const existing = await this.reviewRepository.existsForOrderItem(
      dto.orderItemId,
    );
    if (existing) {
      throw new AppException(
        'REVIEW_001',
        'Order item already reviewed',
        HttpStatus.CONFLICT,
      );
    }

    const review = await this.reviewRepository.create({
      productId: orderItem.productId,
      orderItemId: dto.orderItemId,
      userId,
      rating: dto.rating,
      comment: dto.comment,
    });

    const avgRating = await this.reviewRepository.averageRatingForProduct(
      orderItem.productId,
    );
    await this.catalogPort.updateProductRating(
      orderItem.productId,
      avgRating ?? dto.rating,
    );

    return review;
  }

  async listForProduct(productId: number, page: number, limit: number) {
    const { items, total } = await this.reviewRepository.findByProduct(
      productId,
      page,
      limit,
    );
    return { items, meta: { page, limit, total } };
  }

  async reply(ownerId: number, reviewId: number, reply: string) {
    const review =
      await this.reviewRepository.findWithProductShopOwner(reviewId);
    if (!review) {
      throw new AppException(
        'COMMON_404',
        'Review not found',
        HttpStatus.NOT_FOUND,
      );
    }
    if (review.product.shop.ownerId !== ownerId) {
      throw new AppException(
        'AUTH_003',
        'You do not own this product',
        HttpStatus.FORBIDDEN,
      );
    }
    return this.reviewRepository.addSellerReply(reviewId, reply);
  }
}
