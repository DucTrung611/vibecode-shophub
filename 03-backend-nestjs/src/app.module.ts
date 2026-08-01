import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import configuration from './config/configuration';
import { validate } from './config/env.validation';
import { PrismaModule } from './core/database/prisma.module';
import { RedisModule } from './core/cache/redis.module';
import { CoreEventEmitterModule } from './core/events/event-emitter.module';
import { JwtAuthGuard } from './shared/guards/jwt-auth.guard';
import { RolesGuard } from './shared/guards/roles.guard';
import { AuthModule } from './features/auth/auth.module';
import { UserModule } from './features/user/user.module';
import { ShopModule } from './features/shop/shop.module';
import { CatalogModule } from './features/catalog/catalog.module';
import { CartModule } from './features/cart/cart.module';
import { WishlistModule } from './features/wishlist/wishlist.module';
import { VoucherModule } from './features/voucher/voucher.module';
import { OrderModule } from './features/order/order.module';
import { ReviewModule } from './features/review/review.module';
import { NotificationModule } from './features/notification/notification.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, load: [configuration], validate }),
    PrismaModule,
    RedisModule,
    CoreEventEmitterModule,
    UserModule,
    AuthModule,
    ShopModule,
    CatalogModule,
    CartModule,
    WishlistModule,
    VoucherModule,
    OrderModule,
    ReviewModule,
    NotificationModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    { provide: APP_GUARD, useClass: JwtAuthGuard },
    { provide: APP_GUARD, useClass: RolesGuard },
  ],
})
export class AppModule {}
