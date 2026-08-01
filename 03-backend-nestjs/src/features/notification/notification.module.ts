import { Module } from '@nestjs/common';
import { ShopModule } from '../shop/shop.module';
import { NotificationController } from './notification.controller';
import { NotificationListener } from './notification.listener';
import { NotificationRepository } from './notification.repository';
import { NotificationService } from './notification.service';

@Module({
  imports: [ShopModule],
  controllers: [NotificationController],
  providers: [
    NotificationRepository,
    NotificationService,
    NotificationListener,
  ],
})
export class NotificationModule {}
