import { HttpStatus, Inject, Injectable } from '@nestjs/common';
import { AppException } from '../../shared/exceptions/app.exception';
import { slugify } from '../../shared/utils/slugify.util';
import { USER_PORT } from '../user/user.port';
import type { UserPort } from '../user/user.port';
import { CreateShopDto } from './dto/create-shop.dto';
import { UpdateShopDto } from './dto/update-shop.dto';
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
      // No admin shop-approval flow yet — auto-approve at creation (MVP simplification).
      status: 'approved',
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
