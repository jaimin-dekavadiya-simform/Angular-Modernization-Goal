import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import {
  OnGatewayConnection,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Role } from '../common/enums';
import { AppConfig } from '../config/configuration';

/**
 * Socket.IO namespace `/live`.
 *   - everyone receives `stock.updated` { productId, stock }
 *   - clients that connect with `auth: { token: <accessToken> }` also receive
 *     their own `order.status` events (admins receive all of them)
 */
@WebSocketGateway({
  namespace: 'live',
  cors: { origin: true, credentials: true },
})
export class RealtimeGateway implements OnGatewayConnection {
  @WebSocketServer()
  server!: Server;

  constructor(
    private readonly jwt: JwtService,
    private readonly config: ConfigService<AppConfig, true>,
  ) {}

  async handleConnection(client: Socket) {
    const token = (client.handshake.auth as { token?: string } | undefined)
      ?.token;
    if (!token) return;
    try {
      const payload = await this.jwt.verifyAsync<{ sub: number; role: Role }>(
        token,
        {
          secret: this.config.get('jwt', { infer: true }).accessSecret,
        },
      );
      await client.join(`user:${payload.sub}`);
      if (payload.role === Role.Admin) await client.join('admins');
    } catch {
      // invalid token: stay connected as an anonymous listener
    }
  }

  emitStockUpdated(productId: number, stock: number) {
    this.server?.emit('stock.updated', { productId, stock });
  }

  emitOrderStatus(order: {
    id: number;
    userId: number;
    status: string;
    total: number;
  }) {
    this.server?.to(`user:${order.userId}`).to('admins').emit('order.status', {
      orderId: order.id,
      status: order.status,
      total: order.total,
    });
  }
}
