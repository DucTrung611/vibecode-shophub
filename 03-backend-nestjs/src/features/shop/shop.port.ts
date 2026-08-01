import { CreateShopData, UpdateShopData } from './shop.repository';
import { ShopEntity } from './entities/shop.entity';

export const SHOP_PORT = Symbol('SHOP_PORT');

export interface ShopPort {
  findByOwnerId(ownerId: number): Promise<ShopEntity | null>;
  findById(id: number): Promise<ShopEntity | null>;
  findBySlug(slug: string): Promise<ShopEntity | null>;
  create(data: CreateShopData): Promise<ShopEntity>;
  updateByOwnerId(ownerId: number, data: UpdateShopData): Promise<ShopEntity>;
}
