import type { CatalogPort } from '../../catalog/catalog.port';
import type { ShopPort } from '../../shop/shop.port';
import type { UserPort } from '../../user/user.port';
import { OrderRepository } from '../order.repository';
import { OrderService } from '../order.service';

const decimal = (n: number) => ({ toNumber: () => n }) as never;

describe('OrderService', () => {
  let service: OrderService;
  let orderRepository: {
    createOrderGroupWithOrders: jest.Mock;
    findManyForBuyer: jest.Mock;
    findManyForShop: jest.Mock;
    findByIdDetail: jest.Mock;
    updateStatus: jest.Mock;
    createShipment: jest.Mock;
    markLatestShipmentDelivered: jest.Mock;
    createPayment: jest.Mock;
    markOrderPaid: jest.Mock;
  };
  let cartPort: {
    findItemsByIdsForUser: jest.Mock;
    clearItemsForUser: jest.Mock;
  };
  let catalogPort: {
    decrementVariantStock: jest.Mock;
    incrementProductSoldCount: jest.Mock;
  };
  let voucherPort: { validate: jest.Mock; markUsed: jest.Mock };
  let shopPort: { findByOwnerId: jest.Mock };
  let userPort: { findAddressByIdForUser: jest.Mock };
  let eventEmitter: { emit: jest.Mock };

  const buyerId = 1;
  const address = {
    id: 55,
    userId: buyerId,
    recipientName: 'A',
    phone: '0900000000',
    province: 'HN',
    district: 'D',
    ward: 'W',
    detailAddress: 'Detail',
  };
  const cartItem = (overrides: Record<string, unknown> = {}) => ({
    id: 201,
    variantId: 5,
    quantity: 2,
    variant: {
      id: 5,
      productId: 10,
      price: decimal(100000),
      stockQuantity: 10,
      attributes: { color: 'red' },
      product: { id: 10, name: 'Áo thun', shopId: 8 },
    },
    ...overrides,
  });

  beforeEach(() => {
    orderRepository = {
      createOrderGroupWithOrders: jest.fn(),
      findManyForBuyer: jest.fn(),
      findManyForShop: jest.fn(),
      findByIdDetail: jest.fn(),
      updateStatus: jest.fn(),
      createShipment: jest.fn(),
      markLatestShipmentDelivered: jest.fn(),
      createPayment: jest.fn(),
      markOrderPaid: jest.fn(),
    };
    cartPort = {
      findItemsByIdsForUser: jest.fn(),
      clearItemsForUser: jest.fn(),
    };
    catalogPort = {
      decrementVariantStock: jest.fn(),
      incrementProductSoldCount: jest.fn(),
    };
    voucherPort = { validate: jest.fn(), markUsed: jest.fn() };
    shopPort = { findByOwnerId: jest.fn() };
    userPort = { findAddressByIdForUser: jest.fn() };
    eventEmitter = { emit: jest.fn() };

    service = new OrderService(
      orderRepository as unknown as OrderRepository,
      cartPort,
      catalogPort as unknown as CatalogPort,
      voucherPort,
      shopPort as unknown as ShopPort,
      userPort as unknown as UserPort,
      eventEmitter as never,
    );
  });

  describe('checkout', () => {
    it('throws VALIDATION_001 when the address is invalid', async () => {
      userPort.findAddressByIdForUser.mockResolvedValue(null);

      await expect(
        service.checkout(buyerId, {
          addressId: 55,
          paymentMethod: 'cod',
          cartItemIds: [201],
        }),
      ).rejects.toMatchObject({ response: { code: 'VALIDATION_001' } });
    });

    it('throws ORDER_003 when no cart items match', async () => {
      userPort.findAddressByIdForUser.mockResolvedValue(address);
      cartPort.findItemsByIdsForUser.mockResolvedValue([]);

      await expect(
        service.checkout(buyerId, {
          addressId: 55,
          paymentMethod: 'cod',
          cartItemIds: [201],
        }),
      ).rejects.toMatchObject({ response: { code: 'ORDER_003' } });
    });

    it('throws CART_001 when quantity exceeds current stock', async () => {
      userPort.findAddressByIdForUser.mockResolvedValue(address);
      cartPort.findItemsByIdsForUser.mockResolvedValue([
        cartItem({ quantity: 99 }),
      ]);

      await expect(
        service.checkout(buyerId, {
          addressId: 55,
          paymentMethod: 'cod',
          cartItemIds: [201],
        }),
      ).rejects.toMatchObject({ response: { code: 'CART_001' } });
    });

    it('splits into one order per shop and clears the cart', async () => {
      userPort.findAddressByIdForUser.mockResolvedValue(address);
      cartPort.findItemsByIdsForUser.mockResolvedValue([cartItem()]);
      orderRepository.createOrderGroupWithOrders.mockResolvedValue({
        orderGroup: { id: 91 },
        orders: [
          {
            id: 501,
            shopId: 8,
            orderCode: 'SH-20260801-501',
            totalAmount: decimal(200000),
            status: 'pending',
          },
        ],
      });

      const result = await service.checkout(buyerId, {
        addressId: 55,
        paymentMethod: 'cod',
        cartItemIds: [201],
      });

      expect(orderRepository.createOrderGroupWithOrders).toHaveBeenCalledWith(
        expect.objectContaining({
          buyerId,
          orders: [expect.objectContaining({ shopId: 8, subtotal: 200000 })],
        }),
      );
      expect(catalogPort.decrementVariantStock).toHaveBeenCalledWith(5, 2);
      expect(cartPort.clearItemsForUser).toHaveBeenCalledWith(buyerId, [201]);
      expect(result).toEqual({
        orderGroupId: 91,
        orders: [
          {
            id: 501,
            shopId: 8,
            orderCode: 'SH-20260801-501',
            totalAmount: 200000,
            status: 'pending',
          },
        ],
        grandTotal: 200000,
      });
    });
  });

  describe('cancel', () => {
    it('throws ORDER_002 when the order is not pending', async () => {
      orderRepository.findByIdDetail.mockResolvedValue({
        id: 501,
        buyerId,
        status: 'shipped',
      });

      await expect(service.cancel(buyerId, 501)).rejects.toMatchObject({
        response: { code: 'ORDER_002' },
      });
    });

    it('cancels a pending order owned by the caller', async () => {
      orderRepository.findByIdDetail.mockResolvedValue({
        id: 501,
        buyerId,
        status: 'pending',
      });

      await service.cancel(buyerId, 501);

      expect(orderRepository.updateStatus).toHaveBeenCalledWith(
        501,
        'cancelled',
      );
    });
  });

  describe('updateStatus', () => {
    it('throws ORDER_002 for an invalid transition', async () => {
      orderRepository.findByIdDetail.mockResolvedValue({
        id: 501,
        shopId: 8,
        status: 'delivered',
      });
      shopPort.findByOwnerId.mockResolvedValue({ id: 8 });

      await expect(
        service.updateStatus(1, 501, { status: 'confirmed' }),
      ).rejects.toMatchObject({ response: { code: 'ORDER_002' } });
    });

    it('throws AUTH_003 when the caller does not own the shop', async () => {
      orderRepository.findByIdDetail.mockResolvedValue({
        id: 501,
        shopId: 8,
        status: 'pending',
      });
      shopPort.findByOwnerId.mockResolvedValue({ id: 99 });

      await expect(
        service.updateStatus(1, 501, { status: 'confirmed' }),
      ).rejects.toMatchObject({ response: { code: 'AUTH_003' } });
    });
  });
});
