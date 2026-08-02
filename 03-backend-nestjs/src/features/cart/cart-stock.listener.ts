import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { EventsGateway } from '../../core/events/ws.gateway';
import { VARIANT_STOCK_CHANGED } from '../catalog/catalog.events';
import type { VariantStockChangedEvent } from '../catalog/catalog.events';
import { CartRepository } from './cart.repository';

@Injectable()
export class CartStockListener {
  constructor(
    private readonly cartRepository: CartRepository,
    private readonly eventsGateway: EventsGateway,
  ) {}

  @OnEvent(VARIANT_STOCK_CHANGED)
  async handleVariantStockChanged(payload: VariantStockChangedEvent) {
    const userIds = await this.cartRepository.findUserIdsWithVariantInCart(
      payload.variantId,
    );
    for (const userId of userIds) {
      this.eventsGateway.emitToUser(userId, 'cart.stock.changed', payload);
    }
  }
}
