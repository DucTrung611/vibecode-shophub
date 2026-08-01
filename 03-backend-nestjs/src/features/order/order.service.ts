import { HttpStatus, Inject, Injectable } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { AppException } from '../../shared/exceptions/app.exception';
import { CART_PORT } from '../cart/cart.port';
import type { CartPort } from '../cart/cart.port';
import { CATALOG_PORT } from '../catalog/catalog.port';
import type { CatalogPort } from '../catalog/catalog.port';
import { SHOP_PORT } from '../shop/shop.port';
import type { ShopPort } from '../shop/shop.port';
import { USER_PORT } from '../user/user.port';
import type { UserPort } from '../user/user.port';
import { VOUCHER_PORT } from '../voucher/voucher.port';
import type { VoucherPort } from '../voucher/voucher.port';
import { CheckoutDto } from './dto/checkout.dto';
import { InitiatePaymentDto } from './dto/initiate-payment.dto';
import { ListOrdersQueryDto } from './dto/list-orders.query.dto';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto';
import { ORDER_CREATED } from './order.events';
import { CreateShopOrderInput, OrderRepository } from './order.repository';
import { ORDER_STATUS_TRANSITIONS } from './types/order.types';

const MVP_SHIPPING_FEE = 0; // MVP: no shipping-fee calculator yet

@Injectable()
export class OrderService {
  constructor(
    private readonly orderRepository: OrderRepository,
    @Inject(CART_PORT) private readonly cartPort: CartPort,
    @Inject(CATALOG_PORT) private readonly catalogPort: CatalogPort,
    @Inject(VOUCHER_PORT) private readonly voucherPort: VoucherPort,
    @Inject(SHOP_PORT) private readonly shopPort: ShopPort,
    @Inject(USER_PORT) private readonly userPort: UserPort,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async checkout(buyerId: number, dto: CheckoutDto) {
    const address = await this.userPort.findAddressByIdForUser(
      buyerId,
      dto.addressId,
    );
    if (!address) {
      throw new AppException(
        'VALIDATION_001',
        'Missing or invalid addressId',
        HttpStatus.BAD_REQUEST,
      );
    }

    const cartItems = await this.cartPort.findItemsByIdsForUser(
      buyerId,
      dto.cartItemIds,
    );
    if (cartItems.length === 0) {
      throw new AppException(
        'ORDER_003',
        'Cart selection is empty',
        HttpStatus.UNPROCESSABLE_ENTITY,
      );
    }

    for (const item of cartItems) {
      if (item.quantity > item.variant.stockQuantity) {
        throw new AppException(
          'CART_001',
          `Insufficient stock for ${item.variant.product.name}`,
          HttpStatus.CONFLICT,
        );
      }
    }

    const groupsByShop = new Map<number, typeof cartItems>();
    for (const item of cartItems) {
      const shopId = item.variant.product.shopId;
      const group = groupsByShop.get(shopId) ?? [];
      group.push(item);
      groupsByShop.set(shopId, group);
    }

    const shopOrders: CreateShopOrderInput[] = Array.from(
      groupsByShop.entries(),
    ).map(([shopId, items]) => {
      const orderItems = items.map((item) => {
        const unitPrice = item.variant.price.toNumber();
        const subtotal = unitPrice * item.quantity;
        return {
          productId: item.variant.productId,
          variantId: item.variantId,
          productNameSnapshot: item.variant.product.name,
          variantAttrsSnapshot: item.variant.attributes,
          unitPrice,
          quantity: item.quantity,
          subtotal,
        };
      });
      const subtotal = orderItems.reduce((sum, i) => sum + i.subtotal, 0);
      return {
        shopId,
        subtotal,
        shippingFee: MVP_SHIPPING_FEE,
        totalAmount: subtotal + MVP_SHIPPING_FEE,
        items: orderItems,
      };
    });

    const grandSubtotal = shopOrders.reduce((sum, o) => sum + o.subtotal, 0);

    let voucherId: number | null = null;
    let totalDiscount = 0;
    if (dto.voucherCode) {
      const validation = await this.voucherPort.validate(
        dto.voucherCode,
        grandSubtotal,
      );
      voucherId = validation.voucherId;
      totalDiscount = validation.discountAmount;
    }

    const ordersInput: CreateShopOrderInput[] = shopOrders.map((order) => {
      const discountShare =
        grandSubtotal > 0
          ? Math.round((totalDiscount * order.subtotal) / grandSubtotal)
          : 0;
      const totalAmount = Math.max(
        order.subtotal + order.shippingFee - discountShare,
        0,
      );
      return { ...order, totalAmount };
    });

    const shippingAddressSnapshot = {
      recipientName: address.recipientName,
      phone: address.phone,
      province: address.province,
      district: address.district,
      ward: address.ward,
      detailAddress: address.detailAddress,
    };

    const { orderGroup, orders } =
      await this.orderRepository.createOrderGroupWithOrders({
        buyerId,
        shippingAddress: shippingAddressSnapshot,
        orders: ordersInput,
      });

    await Promise.all(
      cartItems.map((item) =>
        this.catalogPort.decrementVariantStock(item.variantId, item.quantity),
      ),
    );
    await Promise.all(
      ordersInput.flatMap((order) =>
        order.items.map((item) =>
          this.catalogPort.incrementProductSoldCount(
            item.productId,
            item.quantity,
          ),
        ),
      ),
    );

    if (voucherId !== null) {
      await this.voucherPort.markUsed(voucherId);
    }

    await this.cartPort.clearItemsForUser(buyerId, dto.cartItemIds);

    for (const order of orders) {
      this.eventEmitter.emit(ORDER_CREATED, {
        orderId: order.id,
        buyerId,
        shopId: order.shopId,
        orderCode: order.orderCode,
        totalAmount: order.totalAmount.toNumber(),
      });
    }

    return {
      orderGroupId: orderGroup.id,
      orders: orders.map((order) => ({
        id: order.id,
        shopId: order.shopId,
        orderCode: order.orderCode,
        totalAmount: order.totalAmount.toNumber(),
        status: order.status,
      })),
      grandTotal: orders.reduce(
        (sum, order) => sum + order.totalAmount.toNumber(),
        0,
      ),
    };
  }

  async listOwn(buyerId: number, query: ListOrdersQueryDto) {
    const { items, total } = await this.orderRepository.findManyForBuyer(
      buyerId,
      { page: query.page, limit: query.limit, status: query.status },
    );
    return { items, meta: { page: query.page, limit: query.limit, total } };
  }

  async listForOwnShop(ownerId: number, query: ListOrdersQueryDto) {
    const shop = await this.shopPort.findByOwnerId(ownerId);
    if (!shop) {
      throw new AppException(
        'COMMON_404',
        'You do not have a shop yet',
        HttpStatus.NOT_FOUND,
      );
    }
    const { items, total } = await this.orderRepository.findManyForShop(
      shop.id,
      { page: query.page, limit: query.limit, status: query.status },
    );
    return { items, meta: { page: query.page, limit: query.limit, total } };
  }

  async getById(userId: number, role: string, orderId: number) {
    const order = await this.orderRepository.findByIdDetail(orderId);
    if (!order) {
      throw new AppException(
        'ORDER_001',
        'Order not found',
        HttpStatus.NOT_FOUND,
      );
    }

    if (order.buyerId === userId || role === 'admin') {
      return order;
    }

    const shop = await this.shopPort.findByOwnerId(userId);
    if (shop && shop.id === order.shopId) {
      return order;
    }

    throw new AppException(
      'AUTH_003',
      'You do not have access to this order',
      HttpStatus.FORBIDDEN,
    );
  }

  async cancel(buyerId: number, orderId: number) {
    const order = await this.orderRepository.findByIdDetail(orderId);
    if (!order) {
      throw new AppException(
        'ORDER_001',
        'Order not found',
        HttpStatus.NOT_FOUND,
      );
    }
    if (order.buyerId !== buyerId) {
      throw new AppException(
        'AUTH_003',
        'You do not own this order',
        HttpStatus.FORBIDDEN,
      );
    }
    if (order.status !== 'pending') {
      throw new AppException(
        'ORDER_002',
        'Order cannot be cancelled after it has been confirmed',
        HttpStatus.CONFLICT,
      );
    }
    return this.orderRepository.updateStatus(orderId, 'cancelled');
  }

  async updateStatus(
    ownerId: number,
    orderId: number,
    dto: UpdateOrderStatusDto,
  ) {
    const order = await this.orderRepository.findByIdDetail(orderId);
    if (!order) {
      throw new AppException(
        'ORDER_001',
        'Order not found',
        HttpStatus.NOT_FOUND,
      );
    }

    const shop = await this.shopPort.findByOwnerId(ownerId);
    if (!shop || shop.id !== order.shopId) {
      throw new AppException(
        'AUTH_003',
        'You do not own the shop for this order',
        HttpStatus.FORBIDDEN,
      );
    }

    const allowedNext = ORDER_STATUS_TRANSITIONS[order.status];
    if (!allowedNext.includes(dto.status)) {
      throw new AppException(
        'ORDER_002',
        `Order cannot transition from ${order.status} to ${dto.status}`,
        HttpStatus.CONFLICT,
      );
    }

    const updated = await this.orderRepository.updateStatus(
      orderId,
      dto.status,
    );

    if (dto.status === 'shipped') {
      await this.orderRepository.createShipment(orderId, {
        carrier: dto.carrier,
        trackingNumber: dto.trackingNumber,
        status: 'shipped',
        shippedAt: new Date(),
      });
    } else if (dto.status === 'delivered') {
      await this.orderRepository.markLatestShipmentDelivered(orderId);
    }

    this.eventEmitter.emit('order.status.updated', {
      orderId: updated.id,
      buyerId: updated.buyerId,
      status: updated.status,
      updatedAt: updated.updatedAt.toISOString(),
    });

    return {
      id: updated.id,
      status: updated.status,
      updatedAt: updated.updatedAt,
    };
  }

  async initiatePayment(
    buyerId: number,
    orderId: number,
    dto: InitiatePaymentDto,
  ) {
    const order = await this.orderRepository.findByIdDetail(orderId);
    if (!order) {
      throw new AppException(
        'ORDER_001',
        'Order not found',
        HttpStatus.NOT_FOUND,
      );
    }
    if (order.buyerId !== buyerId) {
      throw new AppException(
        'AUTH_003',
        'You do not own this order',
        HttpStatus.FORBIDDEN,
      );
    }

    // MVP: no real payment-gateway integration yet — mark paid synchronously.
    await this.orderRepository.createPayment(orderId, {
      method: dto.method,
      amount: order.totalAmount.toNumber(),
      status: 'success',
      paidAt: new Date(),
    });
    const updated = await this.orderRepository.markOrderPaid(orderId);

    return { id: updated.id, paymentStatus: updated.paymentStatus };
  }
}
