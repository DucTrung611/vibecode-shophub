import { Inject, Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { ORDER_CREATED, ORDER_STATUS_UPDATED } from '../order/order.events';
import type {
  OrderCreatedEvent,
  OrderStatusUpdatedEvent,
} from '../order/order.events';
import { SHOP_PORT } from '../shop/shop.port';
import type { ShopPort } from '../shop/shop.port';
import { NotificationService } from './notification.service';

@Injectable()
export class NotificationListener {
  private readonly logger = new Logger(NotificationListener.name);

  constructor(
    private readonly notificationService: NotificationService,
    @Inject(SHOP_PORT) private readonly shopPort: ShopPort,
  ) {}

  @OnEvent(ORDER_CREATED)
  async handleOrderCreated(payload: OrderCreatedEvent) {
    await this.notificationService.notifyUser(payload.buyerId, {
      title: 'Order placed',
      content: `Your order ${payload.orderCode} has been placed.`,
      type: 'order_update',
      referenceId: payload.orderId,
    });

    const shop = await this.shopPort.findById(payload.shopId);
    if (!shop) {
      this.logger.warn(`Shop ${payload.shopId} not found for order.created`);
      return;
    }

    await this.notificationService.notifyUser(shop.ownerId, {
      title: 'New order',
      content: `You have a new order ${payload.orderCode}.`,
      type: 'order_update',
      referenceId: payload.orderId,
    });
  }

  @OnEvent(ORDER_STATUS_UPDATED)
  async handleOrderStatusUpdated(payload: OrderStatusUpdatedEvent) {
    await this.notificationService.notifyUser(payload.buyerId, {
      title: 'Order status updated',
      content: `Your order status changed to ${payload.status}.`,
      type: 'order_update',
      referenceId: payload.orderId,
    });
  }
}
