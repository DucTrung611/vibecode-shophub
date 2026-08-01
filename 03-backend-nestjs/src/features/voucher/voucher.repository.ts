import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../core/database/prisma.service';

export interface CreateVoucherData {
  shopId: number;
  code: string;
  type: 'percentage' | 'fixed_amount';
  value: number;
  minOrderAmount?: number;
  maxDiscount?: number;
  usageLimit?: number;
  startsAt: Date;
  endsAt: Date;
}

@Injectable()
export class VoucherRepository {
  constructor(private readonly prisma: PrismaService) {}

  findAvailable() {
    const now = new Date();
    return this.prisma.voucher.findMany({
      where: { startsAt: { lte: now }, endsAt: { gte: now } },
      orderBy: { endsAt: 'asc' },
    });
  }

  findByCode(code: string) {
    return this.prisma.voucher.findUnique({ where: { code } });
  }

  incrementUsedCount(id: number) {
    return this.prisma.voucher.update({
      where: { id },
      data: { usedCount: { increment: 1 } },
    });
  }

  create(data: CreateVoucherData) {
    return this.prisma.voucher.create({ data });
  }
}
