import {
  BadRequestException,
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
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { CurrentUser } from '../../shared/decorators/current-user.decorator';
import { Public } from '../../shared/decorators/public.decorator';
import { Roles } from '../../shared/decorators/roles.decorator';
import type { AuthenticatedUser } from '../../shared/types/auth.types';
import { CreateShopDto } from './dto/create-shop.dto';
import { ListShopsQueryDto } from './dto/list-shops.query.dto';
import {
  SHOP_IMAGES_URL_PREFIX,
  shopImageMulterOptions,
} from './shop-image.multer-config';
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

  @Roles('seller')
  @Get('shops/me')
  getOwn(@CurrentUser() user: AuthenticatedUser) {
    return this.shopService.getOwn(user.id);
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

  @Roles('seller')
  @Post('shops/me/logo')
  @HttpCode(HttpStatus.OK)
  @UseInterceptors(FileInterceptor('logo', shopImageMulterOptions))
  uploadLogo(
    @CurrentUser() user: AuthenticatedUser,
    @UploadedFile() file: Express.Multer.File,
  ) {
    if (!file) {
      throw new BadRequestException('A logo image file is required');
    }
    return this.shopService.updateLogo(
      user.id,
      `${SHOP_IMAGES_URL_PREFIX}/${file.filename}`,
    );
  }

  @Roles('seller')
  @Post('shops/me/banner')
  @HttpCode(HttpStatus.OK)
  @UseInterceptors(FileInterceptor('banner', shopImageMulterOptions))
  uploadBanner(
    @CurrentUser() user: AuthenticatedUser,
    @UploadedFile() file: Express.Multer.File,
  ) {
    if (!file) {
      throw new BadRequestException('A banner image file is required');
    }
    return this.shopService.updateBanner(
      user.id,
      `${SHOP_IMAGES_URL_PREFIX}/${file.filename}`,
    );
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
