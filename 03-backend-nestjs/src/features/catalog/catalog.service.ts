import { HttpStatus, Inject, Injectable } from '@nestjs/common';
import { AppException } from '../../shared/exceptions/app.exception';
import { slugify } from '../../shared/utils/slugify.util';
import { SHOP_PORT } from '../shop/shop.port';
import type { ShopPort } from '../shop/shop.port';
import { CategoryRepository } from './category.repository';
import { CreateCategoryDto } from './dto/create-category.dto';
import { CreateProductDto } from './dto/create-product.dto';
import { CreateVariantDto } from './dto/create-variant.dto';
import { ListFlaggedProductsQueryDto } from './dto/list-flagged-products.query.dto';
import { ListProductsQueryDto } from './dto/list-products.query.dto';
import { ModerateProductDto } from './dto/moderate-product.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
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

  async getInventorySummary(
    ownerId: number,
    status?: 'in_stock' | 'low_stock' | 'out_of_stock',
  ) {
    const shop = await this.shopPort.findByOwnerId(ownerId);
    if (!shop) {
      throw new AppException(
        'COMMON_404',
        'You do not have a shop yet',
        HttpStatus.NOT_FOUND,
      );
    }
    return this.productRepository.getInventorySummary(shop.id, status);
  }

  // ---- Admin: category management ----

  async createCategory(dto: CreateCategoryDto) {
    const slug = await this.resolveUniqueCategorySlug(slugify(dto.name));
    return this.categoryRepository.create({ ...dto, slug });
  }

  async updateCategory(id: number, dto: UpdateCategoryDto) {
    await this.assertCategoryExists(id);
    return this.categoryRepository.update(id, dto);
  }

  async deleteCategory(id: number) {
    await this.assertCategoryExists(id);
    const [productCount, childCount] = await Promise.all([
      this.categoryRepository.countProducts(id),
      this.categoryRepository.countChildren(id),
    ]);
    if (productCount > 0 || childCount > 0) {
      throw new AppException(
        'CATEGORY_001',
        'Category has products or child categories, cannot delete',
        HttpStatus.CONFLICT,
      );
    }
    await this.categoryRepository.delete(id);
  }

  // ---- Admin: product moderation ----

  async listFlaggedProducts(query: ListFlaggedProductsQueryDto) {
    const { items, total } = await this.productRepository.findFlagged(
      query.page,
      query.limit,
    );
    return { items, meta: { page: query.page, limit: query.limit, total } };
  }

  async moderateProduct(
    adminId: number,
    productId: number,
    dto: ModerateProductDto,
  ) {
    const product = await this.productRepository.findByIdWithOwner(productId);
    if (!product) {
      throw new AppException(
        'PRODUCT_001',
        'Product not found',
        HttpStatus.NOT_FOUND,
      );
    }
    return this.productRepository.moderate(
      productId,
      adminId,
      dto.action,
      dto.note,
    );
  }

  private async assertCategoryExists(id: number) {
    const category = await this.categoryRepository.findById(id);
    if (!category) {
      throw new AppException(
        'COMMON_404',
        'Category not found',
        HttpStatus.NOT_FOUND,
      );
    }
    return category;
  }

  private async resolveUniqueCategorySlug(baseSlug: string): Promise<string> {
    let slug = baseSlug;
    let suffix = 1;
    const all = await this.categoryRepository.findAll();
    const slugs = new Set(all.map((c) => c.slug));
    while (slugs.has(slug)) {
      suffix += 1;
      slug = `${baseSlug}-${suffix}`;
    }
    return slug;
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
