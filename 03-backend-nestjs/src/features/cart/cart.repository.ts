import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../core/database/prisma.service';
import { CartPort } from './cart.port';
import {
  CART_ITEM_DETAIL_INCLUDE,
  CartItemDetail,
} from './entities/cart.entity';

@Injectable()
export class CartRepository implements CartPort {
  constructor(private readonly prisma: PrismaService) {}

  async findOrCreateActiveCart(userId: number) {
    const existing = await this.prisma.cart.findFirst({ where: { userId } });
    if (existing) return existing;
    return this.prisma.cart.create({ data: { userId } });
  }

  findItemsWithDetail(cartId: number): Promise<CartItemDetail[]> {
    return this.prisma.cartItem.findMany({
      where: { cartId },
      include: CART_ITEM_DETAIL_INCLUDE,
      orderBy: { createdAt: 'asc' },
    });
  }

  findItemByCartAndVariant(cartId: number, variantId: number) {
    return this.prisma.cartItem.findUnique({
      where: { cartId_variantId: { cartId, variantId } },
    });
  }

  findItemWithCartOwner(itemId: number) {
    return this.prisma.cartItem.findUnique({
      where: { id: itemId },
      include: { cart: { select: { userId: true } } },
    });
  }

  createItem(cartId: number, variantId: number, quantity: number) {
    return this.prisma.cartItem.create({
      data: { cartId, variantId, quantity },
    });
  }

  updateItemQuantity(itemId: number, quantity: number) {
    return this.prisma.cartItem.update({
      where: { id: itemId },
      data: { quantity },
    });
  }

  deleteItem(itemId: number) {
    return this.prisma.cartItem.delete({ where: { id: itemId } });
  }

  async findItemsByIdsForUser(
    userId: number,
    itemIds: number[],
  ): Promise<CartItemDetail[]> {
    const cart = await this.prisma.cart.findFirst({ where: { userId } });
    if (!cart) return [];
    return this.prisma.cartItem.findMany({
      where: { cartId: cart.id, id: { in: itemIds } },
      include: CART_ITEM_DETAIL_INCLUDE,
    });
  }

  async clearItemsForUser(userId: number, itemIds: number[]): Promise<void> {
    const cart = await this.prisma.cart.findFirst({ where: { userId } });
    if (!cart) return;
    await this.prisma.cartItem.deleteMany({
      where: { cartId: cart.id, id: { in: itemIds } },
    });
  }
}
