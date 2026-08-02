import { Inject, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import {
  OnGatewayConnection,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import type { JwtPayload } from '../../features/auth/types/auth.types';
import { SHOP_PORT } from '../../features/shop/shop.port';
import type { ShopPort } from '../../features/shop/shop.port';

@Injectable()
@WebSocketGateway({ namespace: '/ws', cors: { origin: '*' } })
export class EventsGateway implements OnGatewayConnection {
  @WebSocketServer()
  private readonly server: Server;

  private readonly logger = new Logger(EventsGateway.name);

  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    @Inject(SHOP_PORT) private readonly shopPort: ShopPort,
  ) {}

  async handleConnection(client: Socket) {
    try {
      const token = this.extractToken(client);
      const payload = await this.jwtService.verifyAsync<JwtPayload>(token, {
        secret: this.configService.get<string>('jwt.secret'),
      });

      await client.join(`user:${payload.sub}`);

      if (payload.role === 'seller') {
        const shop = await this.shopPort.findByOwnerId(payload.sub);
        if (shop) {
          await client.join(`shop:${shop.id}`);
        }
      }
    } catch (error) {
      this.logger.warn(`WS handshake rejected: ${(error as Error).message}`);
      client.disconnect(true);
    }
  }

  private extractToken(client: Socket): string {
    const header = client.handshake.headers.authorization;
    const authToken = client.handshake.auth?.token as string | undefined;
    const raw = header ?? authToken;
    if (!raw) {
      throw new Error('Missing Authorization handshake header');
    }
    return raw.startsWith('Bearer ') ? raw.slice(7) : raw;
  }

  emitToUser(userId: number, event: string, payload: unknown): void {
    this.server.to(`user:${userId}`).emit(event, payload);
  }

  emitToShop(shopId: number, event: string, payload: unknown): void {
    this.server.to(`shop:${shopId}`).emit(event, payload);
  }
}
