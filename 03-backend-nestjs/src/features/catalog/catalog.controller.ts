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
import { CreateCategoryDto } from './dto/create-category.dto';
import { CreateProductDto } from './dto/create-product.dto';
import { CreateVariantDto } from './dto/create-variant.dto';
import { ListFlaggedProductsQueryDto } from './dto/list-flagged-products.query.dto';
import { ListProductsQueryDto } from './dto/list-products.query.dto';
import { ModerateProductDto } from './dto/moderate-product.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
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

  @Roles('seller')
  @Get('shops/me/inventory/summary')
  getInventorySummary(
    @CurrentUser() user: AuthenticatedUser,
    @Query('status') status?: 'in_stock' | 'low_stock' | 'out_of_stock',
  ) {
    return this.catalogService.getInventorySummary(user.id, status);
  }

  @Roles('admin')
  @Post('categories')
  @HttpCode(HttpStatus.CREATED)
  createCategory(@Body() dto: CreateCategoryDto) {
    return this.catalogService.createCategory(dto);
  }

  @Roles('admin')
  @Patch('categories/:id')
  updateCategory(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateCategoryDto,
  ) {
    return this.catalogService.updateCategory(id, dto);
  }

  @Roles('admin')
  @Delete('categories/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  deleteCategory(@Param('id', ParseIntPipe) id: number) {
    return this.catalogService.deleteCategory(id);
  }

  @Roles('admin')
  @Get('admin/products')
  listFlaggedProducts(@Query() query: ListFlaggedProductsQueryDto) {
    return this.catalogService.listFlaggedProducts(query);
  }

  @Roles('admin')
  @Patch('admin/products/:id/moderate')
  moderateProduct(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: ModerateProductDto,
  ) {
    return this.catalogService.moderateProduct(user.id, id, dto);
  }
}
