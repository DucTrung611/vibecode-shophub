import { HttpStatus, Inject, Injectable } from '@nestjs/common';
import { AppException } from '../../shared/exceptions/app.exception';
import { CATALOG_PORT } from '../catalog/catalog.port';
import type { CatalogPort } from '../catalog/catalog.port';
import { CartRepository } from './cart.repository';

@Injectable()
export class CartService {
  constructor(
    private readonly cartRepository: CartRepository,
    @Inject(CATALOG_PORT) private readonly catalogPort: CatalogPort,
  ) {}

  async getCart(userId: number) {
    const cart = await this.cartRepository.findOrCreateActiveCart(userId);
    const items = await this.cartRepository.findItemsWithDetail(cart.id);
    return { cartId: cart.id, items };
  }

  async addItem(userId: number, variantId: number, quantity: number) {
    const cart = await this.cartRepository.findOrCreateActiveCart(userId);
    const variant = await this.catalogPort.getVariantForCart(variantId);
    if (!variant) {
      throw new AppException(
        'PRODUCT_001',
        'Product variant not found',
        HttpStatus.NOT_FOUND,
      );
    }

    const existing = await this.cartRepository.findItemByCartAndVariant(
      cart.id,
      variantId,
    );
    const nextQuantity = (existing?.quantity ?? 0) + quantity;
    if (nextQuantity > variant.stockQuantity) {
      throw new AppException(
        'CART_001',
        'Cart item quantity exceeds available stock',
        HttpStatus.CONFLICT,
      );
    }

    if (existing) {
      await this.cartRepository.updateItemQuantity(existing.id, nextQuantity);
    } else {
      await this.cartRepository.createItem(cart.id, variantId, quantity);
    }

    return this.getCart(userId);
  }

  async updateItem(userId: number, itemId: number, quantity: number) {
    const item = await this.assertOwnsItem(userId, itemId);
    const variant = await this.catalogPort.getVariantForCart(item.variantId);
    if (!variant || quantity > variant.stockQuantity) {
      throw new AppException(
        'CART_001',
        'Cart item quantity exceeds available stock',
        HttpStatus.CONFLICT,
      );
    }

    await this.cartRepository.updateItemQuantity(itemId, quantity);
    return this.getCart(userId);
  }

  async removeItem(userId: number, itemId: number) {
    await this.assertOwnsItem(userId, itemId);
    await this.cartRepository.deleteItem(itemId);
    return this.getCart(userId);
  }

  private async assertOwnsItem(userId: number, itemId: number) {
    const item = await this.cartRepository.findItemWithCartOwner(itemId);
    if (!item) {
      throw new AppException(
        'COMMON_404',
        'Cart item not found',
        HttpStatus.NOT_FOUND,
      );
    }
    if (item.cart.userId !== userId) {
      throw new AppException(
        'AUTH_003',
        'You do not own this cart item',
        HttpStatus.FORBIDDEN,
      );
    }
    return item;
  }
}
