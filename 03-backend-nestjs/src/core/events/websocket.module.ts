import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ShopModule } from '../../features/shop/shop.module';
import { EventsGateway } from './ws.gateway';

@Module({
  imports: [JwtModule.register({}), ShopModule],
  providers: [EventsGateway],
  exports: [EventsGateway],
})
export class WebsocketModule {}
