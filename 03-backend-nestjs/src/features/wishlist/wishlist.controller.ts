import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Post,
} from '@nestjs/common';
import { CurrentUser } from '../../shared/decorators/current-user.decorator';
import type { AuthenticatedUser } from '../../shared/types/auth.types';
import { AddWishlistItemDto } from './dto/add-wishlist-item.dto';
import { WishlistService } from './wishlist.service';

@Controller({ path: 'wishlist', version: '1' })
export class WishlistController {
  constructor(private readonly wishlistService: WishlistService) {}

  @Get()
  list(@CurrentUser() user: AuthenticatedUser) {
    return this.wishlistService.list(user.id);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  add(@CurrentUser() user: AuthenticatedUser, @Body() dto: AddWishlistItemDto) {
    return this.wishlistService.add(user.id, dto.productId);
  }

  @Delete(':productId')
  remove(
    @CurrentUser() user: AuthenticatedUser,
    @Param('productId', ParseIntPipe) productId: number,
  ) {
    return this.wishlistService.remove(user.id, productId);
  }
}
