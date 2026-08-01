import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { CurrentUser } from '../../shared/decorators/current-user.decorator';
import { Roles } from '../../shared/decorators/roles.decorator';
import type { AuthenticatedUser } from '../../shared/types/auth.types';
import { CheckoutDto } from './dto/checkout.dto';
import { InitiatePaymentDto } from './dto/initiate-payment.dto';
import { ListOrdersQueryDto } from './dto/list-orders.query.dto';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto';
import { OrderService } from './order.service';

@Controller({ version: '1' })
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  @Post('checkout')
  @HttpCode(HttpStatus.CREATED)
  checkout(@CurrentUser() user: AuthenticatedUser, @Body() dto: CheckoutDto) {
    return this.orderService.checkout(user.id, dto);
  }

  @Get('orders')
  listOwn(
    @CurrentUser() user: AuthenticatedUser,
    @Query() query: ListOrdersQueryDto,
  ) {
    return this.orderService.listOwn(user.id, query);
  }

  @Roles('seller')
  @Get('shops/me/orders')
  listForOwnShop(
    @CurrentUser() user: AuthenticatedUser,
    @Query() query: ListOrdersQueryDto,
  ) {
    return this.orderService.listForOwnShop(user.id, query);
  }

  @Get('orders/:id')
  getById(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.orderService.getById(user.id, user.role, id);
  }

  @Patch('orders/:id/cancel')
  cancel(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.orderService.cancel(user.id, id);
  }

  @Roles('seller')
  @Patch('orders/:id/status')
  updateStatus(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateOrderStatusDto,
  ) {
    return this.orderService.updateStatus(user.id, id, dto);
  }

  @Post('orders/:id/payment')
  initiatePayment(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: InitiatePaymentDto,
  ) {
    return this.orderService.initiatePayment(user.id, id, dto);
  }
}
