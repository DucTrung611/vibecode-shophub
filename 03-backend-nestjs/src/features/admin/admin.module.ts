import { Module } from '@nestjs/common';
import { CatalogModule } from '../catalog/catalog.module';
import { OrderModule } from '../order/order.module';
import { ShopModule } from '../shop/shop.module';
import { UserModule } from '../user/user.module';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';

@Module({
  imports: [ShopModule, OrderModule, CatalogModule, UserModule],
  controllers: [AdminController],
  providers: [AdminService],
})
export class AdminModule {}
