import {
  BadRequestException,
  ConflictException,
  HttpException,
  HttpStatus,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { CartItem } from '../cart/cart-item.entity';
import { OrderStatus } from '../common/enums';
import { paginated } from '../common/dto/pagination-query.dto';
import { Product } from '../products/product.entity';
import { RealtimeGateway } from '../realtime/realtime.gateway';
import { AdminOrderQueryDto, CheckoutDto } from './dto/order.dto';
import { OrderItem } from './order-item.entity';
import { Order } from './order.entity';

const round2 = (n: number) => Math.round(n * 100) / 100;

@Injectable()
export class OrdersService {
  constructor(
    @InjectRepository(Order) private readonly orders: Repository<Order>,
    private readonly dataSource: DataSource,
    private readonly realtime: RealtimeGateway,
  ) {}

  async checkout(userId: number, dto: CheckoutDto) {
    if (dto.payment.cardNumber.endsWith('0002')) {
      throw new HttpException('Card declined', HttpStatus.PAYMENT_REQUIRED);
    }

    const changedStock: { id: number; stock: number }[] = [];
    const order = await this.dataSource.transaction(async (em) => {
      const cart = await em.find(CartItem, {
        where: { userId },
        relations: { product: true },
      });
      if (!cart.length) throw new BadRequestException('Cart is empty');

      for (const line of cart) {
        if (line.product.stock < line.quantity) {
          throw new ConflictException(
            `Only ${line.product.stock} of "${line.product.name}" left in stock`,
          );
        }
      }
      for (const line of cart) {
        line.product.stock -= line.quantity;
        await em.save(Product, line.product);
        changedStock.push({ id: line.product.id, stock: line.product.stock });
      }

      const created = await em.save(
        em.create(Order, {
          userId,
          status: OrderStatus.Paid,
          total: round2(
            cart.reduce((sum, l) => sum + l.product.price * l.quantity, 0),
          ),
          shippingAddress: dto.shippingAddress,
          paymentLast4: dto.payment.cardNumber.slice(-4),
          items: cart.map((l) =>
            em.create(OrderItem, {
              productId: l.product.id,
              productName: l.product.name,
              unitPrice: l.product.price,
              quantity: l.quantity,
            }),
          ),
        }),
      );
      await em.delete(CartItem, { userId });
      return created;
    });

    changedStock.forEach((p) => this.realtime.emitStockUpdated(p.id, p.stock));
    this.realtime.emitOrderStatus(order);
    return order;
  }

  listForUser(userId: number) {
    return this.orders.find({
      where: { userId },
      order: { createdAt: 'DESC', id: 'DESC' },
    });
  }

  async findForUser(userId: number, id: number) {
    const order = await this.orders.findOne({ where: { id, userId } });
    if (!order) throw new NotFoundException('Order not found');
    return order;
  }

  async listAll(query: AdminOrderQueryDto) {
    const [rows, total] = await this.orders.findAndCount({
      where: query.status ? { status: query.status } : {},
      order: { createdAt: 'DESC', id: 'DESC' },
      skip: (query.page - 1) * query.limit,
      take: query.limit,
    });
    return paginated(rows, total, query.page, query.limit);
  }

  async updateStatus(id: number, status: OrderStatus) {
    const changedStock: { id: number; stock: number }[] = [];
    const order = await this.dataSource.transaction(async (em) => {
      const found = await em.findOne(Order, { where: { id } });
      if (!found) throw new NotFoundException('Order not found');
      if (found.status === OrderStatus.Cancelled) {
        throw new ConflictException('Cancelled orders cannot change status');
      }
      if (status === OrderStatus.Cancelled) {
        for (const item of found.items) {
          const product = await em.findOne(Product, {
            where: { id: item.productId },
          });
          if (!product) continue;
          product.stock += item.quantity;
          await em.save(Product, product);
          changedStock.push({ id: product.id, stock: product.stock });
        }
      }
      found.status = status;
      return em.save(Order, found);
    });

    changedStock.forEach((p) => this.realtime.emitStockUpdated(p.id, p.stock));
    this.realtime.emitOrderStatus(order);
    return order;
  }
}
