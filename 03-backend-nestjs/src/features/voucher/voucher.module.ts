import { Module } from '@nestjs/common';
import { ShopModule } from '../shop/shop.module';
import { VOUCHER_PORT } from './voucher.port';
import { VoucherController } from './voucher.controller';
import { VoucherRepository } from './voucher.repository';
import { VoucherService } from './voucher.service';

@Module({
  imports: [ShopModule],
  controllers: [VoucherController],
  providers: [
    VoucherRepository,
    VoucherService,
    { provide: VOUCHER_PORT, useExisting: VoucherService },
  ],
  exports: [VOUCHER_PORT],
})
export class VoucherModule {}
