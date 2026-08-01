import { CartItemDetail } from './entities/cart.entity';

export const CART_PORT = Symbol('CART_PORT');

export interface CartPort {
  findItemsByIdsForUser(
    userId: number,
    itemIds: number[],
  ): Promise<CartItemDetail[]>;
  clearItemsForUser(userId: number, itemIds: number[]): Promise<void>;
}
