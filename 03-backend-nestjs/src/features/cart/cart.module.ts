import { Module } from '@nestjs/common';
import { WebsocketModule } from '../../core/events/websocket.module';
import { CatalogModule } from '../catalog/catalog.module';
import { CartStockListener } from './cart-stock.listener';
import { CART_PORT } from './cart.port';
import { CartController } from './cart.controller';
import { CartRepository } from './cart.repository';
import { CartService } from './cart.service';

@Module({
  imports: [CatalogModule, WebsocketModule],
  controllers: [CartController],
  providers: [
    CartRepository,
    { provide: CART_PORT, useExisting: CartRepository },
    CartService,
    CartStockListener,
  ],
  exports: [CART_PORT],
})
export class CartModule {}
