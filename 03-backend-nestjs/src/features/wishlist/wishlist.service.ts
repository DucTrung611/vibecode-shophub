import { HttpStatus, Injectable } from '@nestjs/common';
import { AppException } from '../../shared/exceptions/app.exception';
import { WishlistRepository } from './wishlist.repository';

@Injectable()
export class WishlistService {
  constructor(private readonly wishlistRepository: WishlistRepository) {}

  list(userId: number) {
    return this.wishlistRepository.findByUser(userId);
  }

  async add(userId: number, productId: number) {
    const existing = await this.wishlistRepository.findOne(userId, productId);
    if (existing) {
      return existing;
    }
    return this.wishlistRepository.create(userId, productId);
  }

  async remove(userId: number, productId: number) {
    const existing = await this.wishlistRepository.findOne(userId, productId);
    if (!existing) {
      throw new AppException(
        'COMMON_404',
        'Product is not in your wishlist',
        HttpStatus.NOT_FOUND,
      );
    }
    await this.wishlistRepository.delete(userId, productId);
  }
}
