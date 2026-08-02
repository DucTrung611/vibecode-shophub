import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { CurrentUser } from '../../shared/decorators/current-user.decorator';
import { Public } from '../../shared/decorators/public.decorator';
import { Roles } from '../../shared/decorators/roles.decorator';
import type { AuthenticatedUser } from '../../shared/types/auth.types';
import { CreateShopDto } from './dto/create-shop.dto';
import { ListShopsQueryDto } from './dto/list-shops.query.dto';
import { UpdateShopDto } from './dto/update-shop.dto';
import { UpdateShopStatusDto } from './dto/update-shop-status.dto';
import { ShopService } from './shop.service';

@Controller({ version: '1' })
export class ShopController {
  constructor(private readonly shopService: ShopService) {}

  @Post('shops')
  create(@CurrentUser() user: AuthenticatedUser, @Body() dto: CreateShopDto) {
    return this.shopService.create(user.id, dto);
  }

  @Public()
  @Get('shops/:slug')
  findBySlug(@Param('slug') slug: string) {
    return this.shopService.findBySlug(slug);
  }

  @Patch('shops/me')
  updateOwn(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: UpdateShopDto,
  ) {
    return this.shopService.updateOwn(user.id, dto);
  }

  @Roles('admin')
  @Get('admin/shops')
  listShops(@Query() query: ListShopsQueryDto) {
    return this.shopService.listShops(query);
  }

  @Roles('admin')
  @Get('admin/shops/:id')
  getShopDetail(@Param('id', ParseIntPipe) id: number) {
    return this.shopService.getShopDetail(id);
  }

  @Roles('admin')
  @Patch('admin/shops/:id/status')
  updateShopStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateShopStatusDto,
  ) {
    return this.shopService.updateShopStatus(id, dto);
  }
}
