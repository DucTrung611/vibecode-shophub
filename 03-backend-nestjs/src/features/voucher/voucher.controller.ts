import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
} from '@nestjs/common';
import { CurrentUser } from '../../shared/decorators/current-user.decorator';
import { Roles } from '../../shared/decorators/roles.decorator';
import type { AuthenticatedUser } from '../../shared/types/auth.types';
import { CreateVoucherDto } from './dto/create-voucher.dto';
import { ValidateVoucherDto } from './dto/validate-voucher.dto';
import { VoucherService } from './voucher.service';

@Controller({ version: '1' })
export class VoucherController {
  constructor(private readonly voucherService: VoucherService) {}

  @Get('vouchers')
  list() {
    return this.voucherService.list();
  }

  @Post('vouchers/validate')
  validate(@Body() dto: ValidateVoucherDto) {
    return this.voucherService.validate(dto.code, dto.cartTotal);
  }

  @Roles('seller')
  @Post('shops/me/vouchers')
  @HttpCode(HttpStatus.CREATED)
  createShopVoucher(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: CreateVoucherDto,
  ) {
    return this.voucherService.createShopVoucher(user.id, dto);
  }
}
