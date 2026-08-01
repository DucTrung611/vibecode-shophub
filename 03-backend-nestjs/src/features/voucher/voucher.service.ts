import { HttpStatus, Inject, Injectable } from '@nestjs/common';
import type { Prisma } from '../../../generated/prisma/client';
import { AppException } from '../../shared/exceptions/app.exception';
import { SHOP_PORT } from '../shop/shop.port';
import type { ShopPort } from '../shop/shop.port';
import { CreateVoucherDto } from './dto/create-voucher.dto';
import { VoucherPort, VoucherValidationResult } from './voucher.port';
import { VoucherRepository } from './voucher.repository';

@Injectable()
export class VoucherService implements VoucherPort {
  constructor(
    private readonly voucherRepository: VoucherRepository,
    @Inject(SHOP_PORT) private readonly shopPort: ShopPort,
  ) {}

  list() {
    return this.voucherRepository.findAvailable();
  }

  async validate(
    code: string,
    cartTotal: number,
  ): Promise<VoucherValidationResult> {
    const voucher = await this.voucherRepository.findByCode(code);
    if (!voucher) {
      throw new AppException(
        'VOUCHER_001',
        'Voucher not found',
        HttpStatus.BAD_REQUEST,
      );
    }

    const now = new Date();
    const minOrderAmount = voucher.minOrderAmount
      ? voucher.minOrderAmount.toNumber()
      : 0;
    const usageExceeded =
      voucher.usageLimit !== null && voucher.usedCount >= voucher.usageLimit;

    if (
      voucher.startsAt > now ||
      voucher.endsAt < now ||
      usageExceeded ||
      cartTotal < minOrderAmount
    ) {
      throw new AppException(
        'VOUCHER_001',
        'Voucher expired, usage limit reached, or below minimum order amount',
        HttpStatus.BAD_REQUEST,
      );
    }

    return {
      voucherId: voucher.id,
      discountAmount: this.computeDiscount(voucher, cartTotal),
    };
  }

  async markUsed(voucherId: number): Promise<void> {
    await this.voucherRepository.incrementUsedCount(voucherId);
  }

  async createShopVoucher(ownerId: number, dto: CreateVoucherDto) {
    const shop = await this.shopPort.findByOwnerId(ownerId);
    if (!shop) {
      throw new AppException(
        'COMMON_404',
        'Create a shop before adding vouchers',
        HttpStatus.NOT_FOUND,
      );
    }

    return this.voucherRepository.create({
      shopId: shop.id,
      code: dto.code,
      type: dto.type,
      value: dto.value,
      minOrderAmount: dto.minOrderAmount,
      maxDiscount: dto.maxDiscount,
      usageLimit: dto.usageLimit,
      startsAt: new Date(dto.startsAt),
      endsAt: new Date(dto.endsAt),
    });
  }

  private computeDiscount(
    voucher: {
      type: string;
      value: Prisma.Decimal;
      maxDiscount: Prisma.Decimal | null;
    },
    cartTotal: number,
  ): number {
    const value = voucher.value.toNumber();
    if (voucher.type === 'fixed_amount') {
      return value;
    }
    const raw = (cartTotal * value) / 100;
    const cap = voucher.maxDiscount ? voucher.maxDiscount.toNumber() : Infinity;
    return Math.min(raw, cap);
  }
}
