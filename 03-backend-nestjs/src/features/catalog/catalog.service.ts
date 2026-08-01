import { HttpStatus, Inject, Injectable } from '@nestjs/common';
import { AppException } from '../../shared/exceptions/app.exception';
import { slugify } from '../../shared/utils/slugify.util';
import { SHOP_PORT } from '../shop/shop.port';
import type { ShopPort } from '../shop/shop.port';
import { CategoryRepository } from './category.repository';
import { CreateProductDto } from './dto/create-product.dto';
import { CreateVariantDto } from './dto/create-variant.dto';
import { ListProductsQueryDto } from './dto/list-products.query.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { UpdateVariantDto } from './dto/update-variant.dto';
import { ProductRepository } from './product.repository';

@Injectable()
export class CatalogService {
  constructor(
    private readonly categoryRepository: CategoryRepository,
    private readonly productRepository: ProductRepository,
    @Inject(SHOP_PORT) private readonly shopPort: ShopPort,
  ) {}

  getCategoryTree() {
    return this.categoryRepository.findTree();
  }

  async listProducts(query: ListProductsQueryDto) {
    const { items, total } = await this.productRepository.findMany({
      page: query.page,
      limit: query.limit,
      categoryId: query.categoryId,
      shopId: query.shopId,
      status: query.status ?? 'active',
      minPrice: query.minPrice,
      maxPrice: query.maxPrice,
      sortBy: query.sortBy,
      order: query.order,
    });

    return { items, meta: { page: query.page, limit: query.limit, total } };
  }

  async getProductBySlug(slug: string) {
    const product = await this.productRepository.findBySlug(slug);
    if (!product) {
      throw new AppException(
        'PRODUCT_001',
        'Product not found',
        HttpStatus.NOT_FOUND,
      );
    }
    return product;
  }

  async createProduct(ownerId: number, dto: CreateProductDto) {
    const shop = await this.shopPort.findByOwnerId(ownerId);
    if (!shop) {
      throw new AppException(
        'COMMON_404',
        'Create a shop before adding products',
        HttpStatus.NOT_FOUND,
      );
    }

    const slug = await this.resolveUniqueProductSlug(slugify(dto.name));
    return this.productRepository.create({
      shopId: shop.id,
      categoryId: dto.categoryId,
      name: dto.name,
      slug,
    });
  }

  async updateProduct(
    ownerId: number,
    productId: number,
    dto: UpdateProductDto,
  ) {
    await this.assertOwnsProduct(ownerId, productId);
    return this.productRepository.update(productId, dto);
  }

  async deactivateProduct(ownerId: number, productId: number) {
    await this.assertOwnsProduct(ownerId, productId);
    return this.productRepository.deactivate(productId);
  }

  async createVariant(
    ownerId: number,
    productId: number,
    dto: CreateVariantDto,
  ) {
    await this.assertOwnsProduct(ownerId, productId);
    return this.productRepository.createVariant({ productId, ...dto });
  }

  async updateVariant(
    ownerId: number,
    productId: number,
    variantId: number,
    dto: UpdateVariantDto,
  ) {
    const variant =
      await this.productRepository.findVariantWithOwner(variantId);
    if (!variant || variant.productId !== productId) {
      throw new AppException(
        'PRODUCT_001',
        'Variant not found',
        HttpStatus.NOT_FOUND,
      );
    }
    if (variant.product.shop.ownerId !== ownerId) {
      throw new AppException(
        'AUTH_003',
        'You do not own this product',
        HttpStatus.FORBIDDEN,
      );
    }
    return this.productRepository.updateVariant(variantId, dto);
  }

  private async assertOwnsProduct(ownerId: number, productId: number) {
    const product = await this.productRepository.findByIdWithOwner(productId);
    if (!product) {
      throw new AppException(
        'PRODUCT_001',
        'Product not found',
        HttpStatus.NOT_FOUND,
      );
    }
    if (product.shop.ownerId !== ownerId) {
      throw new AppException(
        'AUTH_003',
        'You do not own this product',
        HttpStatus.FORBIDDEN,
      );
    }
    return product;
  }

  private async resolveUniqueProductSlug(baseSlug: string): Promise<string> {
    let slug = baseSlug;
    let suffix = 1;
    while (await this.productRepository.findBySlug(slug)) {
      suffix += 1;
      slug = `${baseSlug}-${suffix}`;
    }
    return slug;
  }
}
