import {
  CreateShopData,
  ShopStatusValue,
  UpdateShopData,
  UpdateShopStatusData,
} from './shop.repository';
import { ShopEntity } from './entities/shop.entity';

export const SHOP_PORT = Symbol('SHOP_PORT');

export interface ShopPort {
  findByOwnerId(ownerId: number): Promise<ShopEntity | null>;
  findById(id: number): Promise<ShopEntity | null>;
  findBySlug(slug: string): Promise<ShopEntity | null>;
  create(data: CreateShopData): Promise<ShopEntity>;
  updateByOwnerId(ownerId: number, data: UpdateShopData): Promise<ShopEntity>;
  findManyByStatus(
    status: ShopStatusValue | undefined,
    page: number,
    limit: number,
  ): Promise<{ items: ShopEntity[]; total: number }>;
  updateStatus(id: number, data: UpdateShopStatusData): Promise<ShopEntity>;
  countByStatus(): Promise<Record<ShopStatusValue, number>>;
  listRecent(limit: number): Promise<ShopEntity[]>;
}
