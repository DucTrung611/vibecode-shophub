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
  Query,
} from '@nestjs/common';
import { CurrentUser } from '../../shared/decorators/current-user.decorator';
import { Public } from '../../shared/decorators/public.decorator';
import { Roles } from '../../shared/decorators/roles.decorator';
import type { AuthenticatedUser } from '../../shared/types/auth.types';
import { CatalogService } from './catalog.service';
import { CreateProductDto } from './dto/create-product.dto';
import { CreateVariantDto } from './dto/create-variant.dto';
import { ListProductsQueryDto } from './dto/list-products.query.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { UpdateVariantDto } from './dto/update-variant.dto';

@Controller({ version: '1' })
export class CatalogController {
  constructor(private readonly catalogService: CatalogService) {}

  @Public()
  @Get('categories')
  getCategories() {
    return this.catalogService.getCategoryTree();
  }

  @Public()
  @Get('products')
  listProducts(@Query() query: ListProductsQueryDto) {
    return this.catalogService.listProducts(query);
  }

  @Public()
  @Get('products/:slug')
  getProductBySlug(@Param('slug') slug: string) {
    return this.catalogService.getProductBySlug(slug);
  }

  @Roles('seller')
  @Post('products')
  @HttpCode(HttpStatus.CREATED)
  createProduct(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: CreateProductDto,
  ) {
    return this.catalogService.createProduct(user.id, dto);
  }

  @Roles('seller')
  @Patch('products/:id')
  updateProduct(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateProductDto,
  ) {
    return this.catalogService.updateProduct(user.id, id, dto);
  }

  @Roles('seller')
  @Delete('products/:id')
  deactivateProduct(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.catalogService.deactivateProduct(user.id, id);
  }

  @Roles('seller')
  @Post('products/:id/variants')
  @HttpCode(HttpStatus.CREATED)
  createVariant(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: CreateVariantDto,
  ) {
    return this.catalogService.createVariant(user.id, id, dto);
  }

  @Roles('seller')
  @Patch('products/:id/variants/:variantId')
  updateVariant(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id', ParseIntPipe) id: number,
    @Param('variantId', ParseIntPipe) variantId: number,
    @Body() dto: UpdateVariantDto,
  ) {
    return this.catalogService.updateVariant(user.id, id, variantId, dto);
  }
}
