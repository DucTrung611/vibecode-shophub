import { Module } from '@nestjs/common';
import { CatalogModule } from '../catalog/catalog.module';
import { OrderModule } from '../order/order.module';
import { ReviewController } from './review.controller';
import { ReviewRepository } from './review.repository';
import { ReviewService } from './review.service';

@Module({
  imports: [OrderModule, CatalogModule],
  controllers: [ReviewController],
  providers: [ReviewRepository, ReviewService],
})
export class ReviewModule {}
