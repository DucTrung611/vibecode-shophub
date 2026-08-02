import type { CatalogPort } from '../../catalog/catalog.port';
import type { OrderPort } from '../../order/order.port';
import type { ShopPort } from '../../shop/shop.port';
import type { UserPort } from '../../user/user.port';
import { AdminService } from '../admin.service';

describe('AdminService', () => {
  let service: AdminService;
  let shopPort: { countByStatus: jest.Mock; listRecent: jest.Mock };
  let orderPort: { getPlatformOrderStats: jest.Mock };
  let catalogPort: {
    countFlaggedProducts: jest.Mock;
    getTopCategories: jest.Mock;
  };
  let userPort: { countTotal: jest.Mock };

  beforeEach(() => {
    shopPort = {
      countByStatus: jest.fn().mockResolvedValue({
        pending: 3,
        approved: 10,
        suspended: 1,
        rejected: 0,
      }),
      listRecent: jest
        .fn()
        .mockResolvedValue([
          { id: 1, name: 'Shop A', status: 'pending', createdAt: new Date() },
        ]),
    };
    orderPort = {
      getPlatformOrderStats: jest.fn().mockResolvedValue({
        totalOrders: 50,
        gmv30d: 1000000,
        gmvWeekly8: [{ label: 'Tuần 1', value: 100 }],
      }),
    };
    catalogPort = {
      countFlaggedProducts: jest.fn().mockResolvedValue(4),
      getTopCategories: jest
        .fn()
        .mockResolvedValue([{ categoryId: 1, name: 'Electronics', count: 20 }]),
    };
    userPort = { countTotal: jest.fn().mockResolvedValue(200) };

    service = new AdminService(
      shopPort as unknown as ShopPort,
      orderPort as unknown as OrderPort,
      catalogPort as unknown as CatalogPort,
      userPort as unknown as UserPort,
    );
  });

  describe('getDashboard', () => {
    it('aggregates KPIs, needs-action queue, new shops, and top categories', async () => {
      const result = await service.getDashboard();

      expect(result.kpis).toEqual(
        expect.arrayContaining([
          { label: 'Tổng người dùng', value: 200 },
          { label: 'Tổng đơn hàng', value: 50 },
        ]),
      );
      expect(result.needsAction).toEqual([
        { label: 'Gian hàng chờ duyệt', count: 3 },
        { label: 'Sản phẩm chờ kiểm duyệt', count: 4 },
      ]);
      expect(result.newShops).toHaveLength(1);
      expect(result.topCategories).toHaveLength(1);
    });
  });

  describe('getRevenueReport', () => {
    it('returns weekly bars and category breakdown', async () => {
      const result = await service.getRevenueReport();

      expect(result.weeklyBars).toEqual([{ label: 'Tuần 1', value: 100 }]);
      expect(result.categoryBreakdown).toHaveLength(1);
    });
  });
});
