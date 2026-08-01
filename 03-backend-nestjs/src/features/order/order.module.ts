import { Module } from '@nestjs/common';
import { CartModule } from '../cart/cart.module';
import { CatalogModule } from '../catalog/catalog.module';
import { ShopModule } from '../shop/shop.module';
import { UserModule } from '../user/user.module';
import { VoucherModule } from '../voucher/voucher.module';
import { ORDER_PORT } from './order.port';
import { OrderController } from './order.controller';
import { OrderRepository } from './order.repository';
import { OrderService } from './order.service';

@Module({
  imports: [CartModule, CatalogModule, VoucherModule, ShopModule, UserModule],
  controllers: [OrderController],
  providers: [
    OrderRepository,
    { provide: ORDER_PORT, useExisting: OrderRepository },
    OrderService,
  ],
  exports: [ORDER_PORT],
})
export class OrderModule {}
