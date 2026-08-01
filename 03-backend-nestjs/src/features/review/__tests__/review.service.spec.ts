import type { CatalogPort } from '../../catalog/catalog.port';
import { ReviewRepository } from '../review.repository';
import { ReviewService } from '../review.service';

describe('ReviewService', () => {
  let service: ReviewService;
  let reviewRepository: {
    findByProduct: jest.Mock;
    existsForOrderItem: jest.Mock;
    create: jest.Mock;
    addSellerReply: jest.Mock;
    averageRatingForProduct: jest.Mock;
    findWithProductShopOwner: jest.Mock;
  };
  let orderPort: { findOrderItemForReview: jest.Mock };
  let catalogPort: { updateProductRating: jest.Mock };

  const userId = 1;
  const otherUserId = 2;

  beforeEach(() => {
    reviewRepository = {
      findByProduct: jest.fn(),
      existsForOrderItem: jest.fn(),
      create: jest.fn(),
      addSellerReply: jest.fn(),
      averageRatingForProduct: jest.fn(),
      findWithProductShopOwner: jest.fn(),
    };
    orderPort = { findOrderItemForReview: jest.fn() };
    catalogPort = { updateProductRating: jest.fn() };

    service = new ReviewService(
      reviewRepository as unknown as ReviewRepository,
      orderPort,
      catalogPort as unknown as CatalogPort,
    );
  });

  describe('create', () => {
    it('throws COMMON_404 when the order item is not the caller purchase', async () => {
      orderPort.findOrderItemForReview.mockResolvedValue(null);

      await expect(
        service.create(userId, { orderItemId: 1, rating: 5 }),
      ).rejects.toMatchObject({ response: { code: 'COMMON_404' } });
    });

    it('throws REVIEW_001 when the order item was already reviewed', async () => {
      orderPort.findOrderItemForReview.mockResolvedValue({
        id: 1,
        productId: 10,
      });
      reviewRepository.existsForOrderItem.mockResolvedValue({ id: 5 });

      await expect(
        service.create(userId, { orderItemId: 1, rating: 5 }),
      ).rejects.toMatchObject({ response: { code: 'REVIEW_001' } });
    });

    it('creates the review and recomputes the product rating', async () => {
      orderPort.findOrderItemForReview.mockResolvedValue({
        id: 1,
        productId: 10,
      });
      reviewRepository.existsForOrderItem.mockResolvedValue(null);
      reviewRepository.create.mockResolvedValue({ id: 99, rating: 5 });
      reviewRepository.averageRatingForProduct.mockResolvedValue(4.5);

      const result = await service.create(userId, {
        orderItemId: 1,
        rating: 5,
      });

      expect(reviewRepository.create).toHaveBeenCalledWith({
        productId: 10,
        orderItemId: 1,
        userId,
        rating: 5,
        comment: undefined,
      });
      expect(catalogPort.updateProductRating).toHaveBeenCalledWith(10, 4.5);
      expect(result).toEqual({ id: 99, rating: 5 });
    });
  });

  describe('reply', () => {
    it('throws COMMON_404 when the review does not exist', async () => {
      reviewRepository.findWithProductShopOwner.mockResolvedValue(null);

      await expect(service.reply(userId, 1, 'Thanks')).rejects.toMatchObject({
        response: { code: 'COMMON_404' },
      });
    });

    it('throws AUTH_003 when the caller does not own the product', async () => {
      reviewRepository.findWithProductShopOwner.mockResolvedValue({
        id: 1,
        product: { shop: { ownerId: otherUserId } },
      });

      await expect(service.reply(userId, 1, 'Thanks')).rejects.toMatchObject({
        response: { code: 'AUTH_003' },
      });
    });

    it('adds the seller reply when the caller owns the product', async () => {
      reviewRepository.findWithProductShopOwner.mockResolvedValue({
        id: 1,
        product: { shop: { ownerId: userId } },
      });
      reviewRepository.addSellerReply.mockResolvedValue({
        id: 1,
        sellerReply: 'Thanks',
      });

      const result = await service.reply(userId, 1, 'Thanks');

      expect(reviewRepository.addSellerReply).toHaveBeenCalledWith(1, 'Thanks');
      expect(result).toEqual({ id: 1, sellerReply: 'Thanks' });
    });
  });
});
