import { Body, Controller, Get, Param, Patch, Post } from '@nestjs/common';
import { CurrentUser } from '../../shared/decorators/current-user.decorator';
import { Public } from '../../shared/decorators/public.decorator';
import type { AuthenticatedUser } from '../../shared/types/auth.types';
import { CreateShopDto } from './dto/create-shop.dto';
import { UpdateShopDto } from './dto/update-shop.dto';
import { ShopService } from './shop.service';

@Controller({ path: 'shops', version: '1' })
export class ShopController {
  constructor(private readonly shopService: ShopService) {}

  @Post()
  create(@CurrentUser() user: AuthenticatedUser, @Body() dto: CreateShopDto) {
    return this.shopService.create(user.id, dto);
  }

  @Public()
  @Get(':slug')
  findBySlug(@Param('slug') slug: string) {
    return this.shopService.findBySlug(slug);
  }

  @Patch('me')
  updateOwn(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: UpdateShopDto,
  ) {
    return this.shopService.updateOwn(user.id, dto);
  }
}
