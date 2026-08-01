import { Module } from '@nestjs/common';
import { CatalogModule } from '../catalog/catalog.module';
import { CART_PORT } from './cart.port';
import { CartController } from './cart.controller';
import { CartRepository } from './cart.repository';
import { CartService } from './cart.service';

@Module({
  imports: [CatalogModule],
  controllers: [CartController],
  providers: [
    CartRepository,
    { provide: CART_PORT, useExisting: CartRepository },
    CartService,
  ],
  exports: [CART_PORT],
})
export class CartModule {}
