import { HttpStatus, Inject, Injectable } from '@nestjs/common';
import { AppException } from '../../shared/exceptions/app.exception';
import { slugify } from '../../shared/utils/slugify.util';
import { USER_PORT } from '../user/user.port';
import type { UserPort } from '../user/user.port';
import { CreateShopDto } from './dto/create-shop.dto';
import { ListShopsQueryDto } from './dto/list-shops.query.dto';
import { UpdateShopDto } from './dto/update-shop.dto';
import { UpdateShopStatusDto } from './dto/update-shop-status.dto';
import { SHOP_PORT } from './shop.port';
import type { ShopPort } from './shop.port';

@Injectable()
export class ShopService {
  constructor(
    @Inject(SHOP_PORT) private readonly shopPort: ShopPort,
    @Inject(USER_PORT) private readonly userPort: UserPort,
  ) {}

  async create(ownerId: number, dto: CreateShopDto) {
    const existing = await this.shopPort.findByOwnerId(ownerId);
    if (existing) {
      throw new AppException(
        'SHOP_002',
        'You already own a shop',
        HttpStatus.CONFLICT,
      );
    }

    const baseSlug = slugify(dto.name);
    const slug = await this.resolveUniqueSlug(baseSlug);

    const shop = await this.shopPort.create({
      ownerId,
      name: dto.name,
      slug,
      // New shops require admin approval before they're publicly visible/sellable.
      status: 'pending',
    });

    await this.userPort.updateRole(ownerId, 'seller');

    return shop;
  }

  async findBySlug(slug: string) {
    const shop = await this.shopPort.findBySlug(slug);
    if (!shop) {
      throw new AppException(
        'COMMON_404',
        'Shop not found',
        HttpStatus.NOT_FOUND,
      );
    }
    return shop;
  }

  async updateOwn(ownerId: number, dto: UpdateShopDto) {
    const existing = await this.shopPort.findByOwnerId(ownerId);
    if (!existing) {
      throw new AppException(
        'COMMON_404',
        'You do not have a shop yet',
        HttpStatus.NOT_FOUND,
      );
    }
    return this.shopPort.updateByOwnerId(ownerId, dto);
  }

  async listShops(query: ListShopsQueryDto) {
    const { items, total } = await this.shopPort.findManyByStatus(
      query.status,
      query.page,
      query.limit,
    );
    return { items, meta: { page: query.page, limit: query.limit, total } };
  }

  async getShopDetail(id: number) {
    const shop = await this.shopPort.findById(id);
    if (!shop) {
      throw new AppException(
        'COMMON_404',
        'Shop not found',
        HttpStatus.NOT_FOUND,
      );
    }
    return shop;
  }

  async updateShopStatus(id: number, dto: UpdateShopStatusDto) {
    if (dto.status === 'rejected' && !dto.rejectionReason) {
      throw new AppException(
        'SHOP_003',
        'rejectionReason is required when rejecting a shop',
        HttpStatus.BAD_REQUEST,
      );
    }
    await this.getShopDetail(id);
    return this.shopPort.updateStatus(id, {
      status: dto.status,
      rejectionReason: dto.rejectionReason,
    });
  }

  private async resolveUniqueSlug(baseSlug: string): Promise<string> {
    let slug = baseSlug;
    let suffix = 1;
    while (await this.shopPort.findBySlug(slug)) {
      suffix += 1;
      slug = `${baseSlug}-${suffix}`;
    }
    return slug;
  }
}
