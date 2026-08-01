import { Module } from '@nestjs/common';
import { ShopModule } from '../shop/shop.module';
import { CATALOG_PORT } from './catalog.port';
import { CategoryRepository } from './category.repository';
import { CatalogController } from './catalog.controller';
import { CatalogService } from './catalog.service';
import { ProductRepository } from './product.repository';

@Module({
  imports: [ShopModule],
  controllers: [CatalogController],
  providers: [
    CategoryRepository,
    ProductRepository,
    { provide: CATALOG_PORT, useExisting: ProductRepository },
    CatalogService,
  ],
  exports: [CATALOG_PORT],
})
export class CatalogModule {}
