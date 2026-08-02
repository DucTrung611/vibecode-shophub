import type { UserPort } from '../../user/user.port';
import { ShopService } from '../shop.service';

describe('ShopService', () => {
  let service: ShopService;
  let shopPort: {
    findByOwnerId: jest.Mock;
    findById: jest.Mock;
    findBySlug: jest.Mock;
    create: jest.Mock;
    updateByOwnerId: jest.Mock;
    updateImagesByOwnerId: jest.Mock;
    findManyByStatus: jest.Mock;
    updateStatus: jest.Mock;
    countByStatus: jest.Mock;
    listRecent: jest.Mock;
  };
  let userPort: { updateRole: jest.Mock };

  const ownerId = 1;

  beforeEach(() => {
    shopPort = {
      findByOwnerId: jest.fn(),
      findById: jest.fn(),
      findBySlug: jest.fn(),
      create: jest.fn(),
      updateByOwnerId: jest.fn(),
      updateImagesByOwnerId: jest.fn(),
      findManyByStatus: jest.fn(),
      updateStatus: jest.fn(),
      countByStatus: jest.fn(),
      listRecent: jest.fn(),
    };
    userPort = { updateRole: jest.fn() };

    service = new ShopService(shopPort, userPort as unknown as UserPort);
  });

  describe('create', () => {
    it('throws SHOP_002 when the owner already has a shop', async () => {
      shopPort.findByOwnerId.mockResolvedValue({ id: 1 });

      await expect(
        service.create(ownerId, { name: 'My Shop' }),
      ).rejects.toMatchObject({ response: { code: 'SHOP_002' } });
    });

    it('creates a new shop with status pending, not auto-approved', async () => {
      shopPort.findByOwnerId.mockResolvedValue(null);
      shopPort.findBySlug.mockResolvedValue(null);
      shopPort.create.mockResolvedValue({ id: 2, status: 'pending' });

      await service.create(ownerId, { name: 'My Shop' });

      expect(shopPort.create).toHaveBeenCalledWith(
        expect.objectContaining({ status: 'pending' }),
      );
      expect(userPort.updateRole).toHaveBeenCalledWith(ownerId, 'seller');
    });
  });

  describe('updateShopStatus', () => {
    it('throws SHOP_003 when rejecting without a reason', async () => {
      await expect(
        service.updateShopStatus(1, { status: 'rejected' }),
      ).rejects.toMatchObject({ response: { code: 'SHOP_003' } });
    });

    it('throws COMMON_404 when the shop does not exist', async () => {
      shopPort.findById.mockResolvedValue(null);

      await expect(
        service.updateShopStatus(1, { status: 'approved' }),
      ).rejects.toMatchObject({ response: { code: 'COMMON_404' } });
    });

    it('approves a shop', async () => {
      shopPort.findById.mockResolvedValue({ id: 1, status: 'pending' });
      shopPort.updateStatus.mockResolvedValue({ id: 1, status: 'approved' });

      const result = await service.updateShopStatus(1, { status: 'approved' });

      expect(shopPort.updateStatus).toHaveBeenCalledWith(1, {
        status: 'approved',
        rejectionReason: undefined,
      });
      expect(result).toEqual({ id: 1, status: 'approved' });
    });

    it('rejects a shop with a reason', async () => {
      shopPort.findById.mockResolvedValue({ id: 1, status: 'pending' });
      shopPort.updateStatus.mockResolvedValue({ id: 1, status: 'rejected' });

      await service.updateShopStatus(1, {
        status: 'rejected',
        rejectionReason: 'Missing business license',
      });

      expect(shopPort.updateStatus).toHaveBeenCalledWith(1, {
        status: 'rejected',
        rejectionReason: 'Missing business license',
      });
    });
  });

  describe('listShops', () => {
    it('returns paginated shops filtered by status', async () => {
      shopPort.findManyByStatus.mockResolvedValue({
        items: [{ id: 1 }],
        total: 1,
      });

      const result = await service.listShops({
        page: 1,
        limit: 20,
        status: 'pending',
      });

      expect(shopPort.findManyByStatus).toHaveBeenCalledWith('pending', 1, 20);
      expect(result).toEqual({
        items: [{ id: 1 }],
        meta: { page: 1, limit: 20, total: 1 },
      });
    });
  });
});
