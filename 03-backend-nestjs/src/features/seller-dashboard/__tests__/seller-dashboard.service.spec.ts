import type { CatalogPort } from '../../catalog/catalog.port';
import type { OrderPort } from '../../order/order.port';
import type { ShopPort } from '../../shop/shop.port';
import { SellerDashboardService } from '../seller-dashboard.service';

describe('SellerDashboardService', () => {
  let service: SellerDashboardService;
  let shopPort: { findByOwnerId: jest.Mock };
  let orderPort: { getShopOrderStats: jest.Mock };
  let catalogPort: { getShopProductStats: jest.Mock };

  const ownerId = 1;

  beforeEach(() => {
    shopPort = { findByOwnerId: jest.fn() };
    orderPort = { getShopOrderStats: jest.fn() };
    catalogPort = { getShopProductStats: jest.fn() };

    service = new SellerDashboardService(
      shopPort as unknown as ShopPort,
      orderPort as unknown as OrderPort,
      catalogPort as unknown as CatalogPort,
    );
  });

  it('throws COMMON_404 when the caller has no shop', async () => {
    shopPort.findByOwnerId.mockResolvedValue(null);

    await expect(service.getDashboard(ownerId)).rejects.toMatchObject({
      response: { code: 'COMMON_404' },
    });
  });

  it('aggregates order and product stats into a dashboard payload', async () => {
    shopPort.findByOwnerId.mockResolvedValue({ id: 8 });
    orderPort.getShopOrderStats.mockResolvedValue({
      todayRevenue: 500000,
      last7DaysRevenue: [{ label: 'T2', value: 100000 }],
      statusBreakdown: [{ status: 'pending', count: 2 }],
      cancelRate: 0.1,
      totalOrders: 20,
      recentOrders: [],
    });
    catalogPort.getShopProductStats.mockResolvedValue({
      totalListings: 12,
      topProducts: [{ id: 1, name: 'Product A', soldCount: 5 }],
    });

    const result = await service.getDashboard(ownerId);

    expect(orderPort.getShopOrderStats).toHaveBeenCalledWith(8);
    expect(catalogPort.getShopProductStats).toHaveBeenCalledWith(8);
    expect(result.kpis).toEqual(
      expect.arrayContaining([
        { label: 'Doanh thu hôm nay', value: 500000 },
        { label: 'Tổng đơn hàng', value: 20 },
        { label: 'Sản phẩm đang bán', value: 12 },
      ]),
    );
    expect(result.topProducts).toEqual([
      { id: 1, name: 'Product A', soldCount: 5 },
    ]);
  });
});
