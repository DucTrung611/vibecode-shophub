import { Inject, Injectable } from '@nestjs/common';
import { CATALOG_PORT } from '../catalog/catalog.port';
import type { CatalogPort } from '../catalog/catalog.port';
import { ORDER_PORT } from '../order/order.port';
import type { OrderPort } from '../order/order.port';
import { SHOP_PORT } from '../shop/shop.port';
import type { ShopPort } from '../shop/shop.port';
import { USER_PORT } from '../user/user.port';
import type { UserPort } from '../user/user.port';

@Injectable()
export class AdminService {
  constructor(
    @Inject(SHOP_PORT) private readonly shopPort: ShopPort,
    @Inject(ORDER_PORT) private readonly orderPort: OrderPort,
    @Inject(CATALOG_PORT) private readonly catalogPort: CatalogPort,
    @Inject(USER_PORT) private readonly userPort: UserPort,
  ) {}

  async getDashboard() {
    const [
      shopCounts,
      orderStats,
      totalUsers,
      flaggedProducts,
      recentShops,
      topCategories,
    ] = await Promise.all([
      this.shopPort.countByStatus(),
      this.orderPort.getPlatformOrderStats(),
      this.userPort.countTotal(),
      this.catalogPort.countFlaggedProducts(),
      this.shopPort.listRecent(5),
      this.catalogPort.getTopCategories(5),
    ]);

    return {
      kpis: [
        { label: 'GMV 30 ngày', value: orderStats.gmv30d },
        { label: 'Tổng người dùng', value: totalUsers },
        {
          label: 'Gian hàng hoạt động',
          value: shopCounts.approved,
          pendingCount: shopCounts.pending,
        },
        { label: 'Tổng đơn hàng', value: orderStats.totalOrders },
      ],
      gmvWeekly: orderStats.gmvWeekly8,
      needsAction: [
        { label: 'Gian hàng chờ duyệt', count: shopCounts.pending },
        { label: 'Sản phẩm chờ kiểm duyệt', count: flaggedProducts },
      ],
      newShops: recentShops.map((s) => ({
        id: s.id,
        name: s.name,
        status: s.status,
        createdAt: s.createdAt,
      })),
      topCategories,
    };
  }

  async getRevenueReport() {
    const [orderStats, topCategories, recentShops] = await Promise.all([
      this.orderPort.getPlatformOrderStats(),
      this.catalogPort.getTopCategories(5),
      this.shopPort.listRecent(5),
    ]);

    return {
      kpis: [
        { label: 'GMV 30 ngày', value: orderStats.gmv30d },
        { label: 'Tổng đơn hàng', value: orderStats.totalOrders },
      ],
      weeklyBars: orderStats.gmvWeekly8,
      categoryBreakdown: topCategories,
      // MVP simplification: no per-shop revenue aggregation port yet, so "top sellers"
      // surfaces the most recently onboarded shops rather than a true revenue ranking.
      topSellers: recentShops.map((s) => ({ id: s.id, name: s.name })),
    };
  }
}
