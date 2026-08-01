import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Patch,
  Post,
} from '@nestjs/common';
import { CurrentUser } from '../../shared/decorators/current-user.decorator';
import type { AuthenticatedUser } from '../../shared/types/auth.types';
import { CartService } from './cart.service';
import { AddCartItemDto } from './dto/add-cart-item.dto';
import { UpdateCartItemDto } from './dto/update-cart-item.dto';

@Controller({ path: 'cart', version: '1' })
export class CartController {
  constructor(private readonly cartService: CartService) {}

  @Get()
  getCart(@CurrentUser() user: AuthenticatedUser) {
    return this.cartService.getCart(user.id);
  }

  @Post('items')
  @HttpCode(HttpStatus.CREATED)
  addItem(@CurrentUser() user: AuthenticatedUser, @Body() dto: AddCartItemDto) {
    return this.cartService.addItem(user.id, dto.variantId, dto.quantity);
  }

  @Patch('items/:id')
  updateItem(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateCartItemDto,
  ) {
    return this.cartService.updateItem(user.id, id, dto.quantity);
  }

  @Delete('items/:id')
  removeItem(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.cartService.removeItem(user.id, id);
  }
}
