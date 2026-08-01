import { Module } from '@nestjs/common';
import { UserModule } from '../user/user.module';
import { ShopController } from './shop.controller';
import { ShopRepository } from './shop.repository';
import { SHOP_PORT } from './shop.port';
import { ShopService } from './shop.service';

@Module({
  imports: [UserModule],
  controllers: [ShopController],
  providers: [
    ShopRepository,
    { provide: SHOP_PORT, useExisting: ShopRepository },
    ShopService,
  ],
  exports: [SHOP_PORT],
})
export class ShopModule {}
