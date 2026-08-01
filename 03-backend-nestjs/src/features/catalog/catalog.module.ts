import { Module } from '@nestjs/common';
import { ShopModule } from '../shop/shop.module';
import { CategoryRepository } from './category.repository';
import { CatalogController } from './catalog.controller';
import { CatalogService } from './catalog.service';
import { ProductRepository } from './product.repository';

@Module({
  imports: [ShopModule],
  controllers: [CatalogController],
  providers: [CategoryRepository, ProductRepository, CatalogService],
})
export class CatalogModule {}
