import { HttpStatus, Inject, Injectable } from '@nestjs/common';
import { AppException } from '../../shared/exceptions/app.exception';
import { CATALOG_PORT } from '../catalog/catalog.port';
import type { CatalogPort } from '../catalog/catalog.port';
import { ORDER_PORT } from '../order/order.port';
import type { OrderPort } from '../order/order.port';
import { SHOP_PORT } from '../shop/shop.port';
import type { ShopPort } from '../shop/shop.port';

@Injectable()
export class SellerDashboardService {
  constructor(
    @Inject(SHOP_PORT) private readonly shopPort: ShopPort,
    @Inject(ORDER_PORT) private readonly orderPort: OrderPort,
    @Inject(CATALOG_PORT) private readonly catalogPort: CatalogPort,
  ) {}

  async getDashboard(ownerId: number) {
    const shop = await this.shopPort.findByOwnerId(ownerId);
    if (!shop) {
      throw new AppException(
        'COMMON_404',
        'You do not have a shop yet',
        HttpStatus.NOT_FOUND,
      );
    }

    const [orderStats, productStats] = await Promise.all([
      this.orderPort.getShopOrderStats(shop.id),
      this.catalogPort.getShopProductStats(shop.id),
    ]);

    return {
      kpis: [
        { label: 'Doanh thu hôm nay', value: orderStats.todayRevenue },
        { label: 'Tổng đơn hàng', value: orderStats.totalOrders },
        { label: 'Sản phẩm đang bán', value: productStats.totalListings },
        {
          label: 'Tỉ lệ huỷ đơn',
          value: Math.round(orderStats.cancelRate * 1000) / 10,
        },
      ],
      revenueBars: orderStats.last7DaysRevenue,
      orderStatusBreakdown: orderStats.statusBreakdown,
      recentOrders: orderStats.recentOrders,
      topProducts: productStats.topProducts,
    };
  }
}
