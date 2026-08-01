import type { ShopPort } from '../../shop/shop.port';
import { VoucherRepository } from '../voucher.repository';
import { VoucherService } from '../voucher.service';

const decimal = (n: number) => ({ toNumber: () => n }) as never;

describe('VoucherService', () => {
  let service: VoucherService;
  let voucherRepository: {
    findAvailable: jest.Mock;
    findByCode: jest.Mock;
    incrementUsedCount: jest.Mock;
    create: jest.Mock;
  };
  let shopPort: { findByOwnerId: jest.Mock };

  const ownerId = 1;
  const now = new Date('2026-08-01T00:00:00Z');
  const activeVoucher = {
    id: 1,
    code: 'SHOPHUB50',
    type: 'percentage',
    value: decimal(10),
    minOrderAmount: decimal(100000),
    maxDiscount: decimal(20000),
    usageLimit: 100,
    usedCount: 5,
    startsAt: new Date('2026-07-01T00:00:00Z'),
    endsAt: new Date('2026-12-31T00:00:00Z'),
  };

  beforeEach(() => {
    jest.useFakeTimers().setSystemTime(now);
    voucherRepository = {
      findAvailable: jest.fn(),
      findByCode: jest.fn(),
      incrementUsedCount: jest.fn(),
      create: jest.fn(),
    };
    shopPort = { findByOwnerId: jest.fn() };

    service = new VoucherService(
      voucherRepository as unknown as VoucherRepository,
      shopPort as unknown as ShopPort,
    );
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  describe('validate', () => {
    it('throws VOUCHER_001 when the code does not exist', async () => {
      voucherRepository.findByCode.mockResolvedValue(null);

      await expect(service.validate('MISSING', 200000)).rejects.toMatchObject({
        response: { code: 'VOUCHER_001' },
      });
    });

    it('throws VOUCHER_001 when expired', async () => {
      voucherRepository.findByCode.mockResolvedValue({
        ...activeVoucher,
        endsAt: new Date('2026-01-01T00:00:00Z'),
      });

      await expect(service.validate('SHOPHUB50', 200000)).rejects.toMatchObject(
        { response: { code: 'VOUCHER_001' } },
      );
    });

    it('throws VOUCHER_001 when usage limit reached', async () => {
      voucherRepository.findByCode.mockResolvedValue({
        ...activeVoucher,
        usageLimit: 5,
        usedCount: 5,
      });

      await expect(service.validate('SHOPHUB50', 200000)).rejects.toMatchObject(
        { response: { code: 'VOUCHER_001' } },
      );
    });

    it('throws VOUCHER_001 when below minOrderAmount', async () => {
      voucherRepository.findByCode.mockResolvedValue(activeVoucher);

      await expect(service.validate('SHOPHUB50', 50000)).rejects.toMatchObject({
        response: { code: 'VOUCHER_001' },
      });
    });

    it('caps a percentage discount at maxDiscount', async () => {
      voucherRepository.findByCode.mockResolvedValue(activeVoucher);

      const result = await service.validate('SHOPHUB50', 500000);

      expect(result).toEqual({ voucherId: 1, discountAmount: 20000 });
    });

    it('returns the fixed amount for fixed_amount vouchers', async () => {
      voucherRepository.findByCode.mockResolvedValue({
        ...activeVoucher,
        type: 'fixed_amount',
        value: decimal(15000),
      });

      const result = await service.validate('SHOPHUB50', 200000);

      expect(result).toEqual({ voucherId: 1, discountAmount: 15000 });
    });
  });

  describe('createShopVoucher', () => {
    it('throws COMMON_404 when the caller has no shop', async () => {
      shopPort.findByOwnerId.mockResolvedValue(null);

      await expect(
        service.createShopVoucher(ownerId, {
          code: 'X',
          type: 'fixed_amount',
          value: 1000,
          startsAt: '2026-08-01T00:00:00Z',
          endsAt: '2026-09-01T00:00:00Z',
        }),
      ).rejects.toMatchObject({ response: { code: 'COMMON_404' } });
    });

    it('creates the voucher under the caller shop', async () => {
      shopPort.findByOwnerId.mockResolvedValue({ id: 8 });
      voucherRepository.create.mockResolvedValue({ id: 2 });

      const result = await service.createShopVoucher(ownerId, {
        code: 'X',
        type: 'fixed_amount',
        value: 1000,
        startsAt: '2026-08-01T00:00:00Z',
        endsAt: '2026-09-01T00:00:00Z',
      });

      expect(voucherRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({ shopId: 8, code: 'X' }),
      );
      expect(result).toEqual({ id: 2 });
    });
  });
});
