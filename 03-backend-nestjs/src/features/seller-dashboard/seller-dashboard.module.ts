import { Module } from '@nestjs/common';
import { CatalogModule } from '../catalog/catalog.module';
import { OrderModule } from '../order/order.module';
import { ShopModule } from '../shop/shop.module';
import { SellerDashboardController } from './seller-dashboard.controller';
import { SellerDashboardService } from './seller-dashboard.service';

@Module({
  imports: [ShopModule, OrderModule, CatalogModule],
  controllers: [SellerDashboardController],
  providers: [SellerDashboardService],
})
export class SellerDashboardModule {}
