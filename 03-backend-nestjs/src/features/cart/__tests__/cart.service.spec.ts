import type { CatalogPort } from '../../catalog/catalog.port';
import { CartRepository } from '../cart.repository';
import { CartService } from '../cart.service';

describe('CartService', () => {
  let service: CartService;
  let cartRepository: {
    findOrCreateActiveCart: jest.Mock;
    findItemsWithDetail: jest.Mock;
    findItemByCartAndVariant: jest.Mock;
    findItemWithCartOwner: jest.Mock;
    createItem: jest.Mock;
    updateItemQuantity: jest.Mock;
    deleteItem: jest.Mock;
  };
  let catalogPort: { getVariantForCart: jest.Mock };

  const userId = 1;
  const otherUserId = 2;
  const cart = { id: 100, userId };
  const variant = {
    id: 5,
    productId: 10,
    productName: 'Áo thun',
    attributes: { color: 'red' },
    price: '100000',
    stockQuantity: 10,
  };

  beforeEach(() => {
    cartRepository = {
      findOrCreateActiveCart: jest.fn().mockResolvedValue(cart),
      findItemsWithDetail: jest.fn().mockResolvedValue([]),
      findItemByCartAndVariant: jest.fn(),
      findItemWithCartOwner: jest.fn(),
      createItem: jest.fn(),
      updateItemQuantity: jest.fn(),
      deleteItem: jest.fn(),
    };
    catalogPort = { getVariantForCart: jest.fn() };

    service = new CartService(
      cartRepository as unknown as CartRepository,
      catalogPort as unknown as CatalogPort,
    );
  });

  describe('getCart', () => {
    it('returns the cart id with its items', async () => {
      cartRepository.findItemsWithDetail.mockResolvedValue([{ id: 1 }]);

      const result = await service.getCart(userId);

      expect(result).toEqual({ cartId: 100, items: [{ id: 1 }] });
    });
  });

  describe('addItem', () => {
    it('throws PRODUCT_001 when the variant does not exist', async () => {
      catalogPort.getVariantForCart.mockResolvedValue(null);

      await expect(service.addItem(userId, 5, 1)).rejects.toMatchObject({
        response: { code: 'PRODUCT_001' },
      });
    });

    it('throws CART_001 when quantity exceeds stock', async () => {
      catalogPort.getVariantForCart.mockResolvedValue(variant);
      cartRepository.findItemByCartAndVariant.mockResolvedValue(null);

      await expect(service.addItem(userId, 5, 11)).rejects.toMatchObject({
        response: { code: 'CART_001' },
      });
    });

    it('creates a new item when none exists yet', async () => {
      catalogPort.getVariantForCart.mockResolvedValue(variant);
      cartRepository.findItemByCartAndVariant.mockResolvedValue(null);

      await service.addItem(userId, 5, 3);

      expect(cartRepository.createItem).toHaveBeenCalledWith(100, 5, 3);
    });

    it('accumulates quantity when the variant is already in the cart', async () => {
      catalogPort.getVariantForCart.mockResolvedValue(variant);
      cartRepository.findItemByCartAndVariant.mockResolvedValue({
        id: 7,
        quantity: 4,
      });

      await service.addItem(userId, 5, 3);

      expect(cartRepository.updateItemQuantity).toHaveBeenCalledWith(7, 7);
    });
  });

  describe('updateItem', () => {
    it('throws COMMON_404 when the item does not exist', async () => {
      cartRepository.findItemWithCartOwner.mockResolvedValue(null);

      await expect(service.updateItem(userId, 1, 2)).rejects.toMatchObject({
        response: { code: 'COMMON_404' },
      });
    });

    it('throws AUTH_003 when the item belongs to another user', async () => {
      cartRepository.findItemWithCartOwner.mockResolvedValue({
        id: 1,
        variantId: 5,
        cart: { userId: otherUserId },
      });

      await expect(service.updateItem(userId, 1, 2)).rejects.toMatchObject({
        response: { code: 'AUTH_003' },
      });
    });

    it('throws CART_001 when the new quantity exceeds stock', async () => {
      cartRepository.findItemWithCartOwner.mockResolvedValue({
        id: 1,
        variantId: 5,
        cart: { userId },
      });
      catalogPort.getVariantForCart.mockResolvedValue(variant);

      await expect(service.updateItem(userId, 1, 11)).rejects.toMatchObject({
        response: { code: 'CART_001' },
      });
    });

    it('updates the quantity when valid', async () => {
      cartRepository.findItemWithCartOwner.mockResolvedValue({
        id: 1,
        variantId: 5,
        cart: { userId },
      });
      catalogPort.getVariantForCart.mockResolvedValue(variant);

      await service.updateItem(userId, 1, 5);

      expect(cartRepository.updateItemQuantity).toHaveBeenCalledWith(1, 5);
    });
  });

  describe('removeItem', () => {
    it('throws AUTH_003 when the item belongs to another user', async () => {
      cartRepository.findItemWithCartOwner.mockResolvedValue({
        id: 1,
        cart: { userId: otherUserId },
      });

      await expect(service.removeItem(userId, 1)).rejects.toMatchObject({
        response: { code: 'AUTH_003' },
      });
    });

    it('deletes the item when owned by the caller', async () => {
      cartRepository.findItemWithCartOwner.mockResolvedValue({
        id: 1,
        cart: { userId },
      });

      await service.removeItem(userId, 1);

      expect(cartRepository.deleteItem).toHaveBeenCalledWith(1);
    });
  });
});
