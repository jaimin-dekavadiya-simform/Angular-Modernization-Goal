import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Product } from '../products/product.entity';
import { CartItem } from './cart-item.entity';

const round2 = (n: number) => Math.round(n * 100) / 100;

@Injectable()
export class CartService {
  constructor(
    @InjectRepository(CartItem) private readonly items: Repository<CartItem>,
    @InjectRepository(Product) private readonly products: Repository<Product>,
  ) {}

  async get(userId: number) {
    const items = await this.items.find({
      where: { userId },
      order: { id: 'ASC' },
    });
    const lines = items.map((item) => ({
      productId: item.productId,
      quantity: item.quantity,
      product: item.product,
      lineTotal: round2(item.product.price * item.quantity),
    }));
    return {
      items: lines,
      itemCount: lines.reduce((sum, line) => sum + line.quantity, 0),
      total: round2(lines.reduce((sum, line) => sum + line.lineTotal, 0)),
    };
  }

  async addItem(userId: number, productId: number, quantity: number) {
    const product = await this.getProduct(productId);
    const existing = await this.items.findOne({ where: { userId, productId } });
    const next = (existing?.quantity ?? 0) + quantity;
    this.assertStock(product, next);
    if (existing) {
      existing.quantity = next;
      await this.items.save(existing);
    } else {
      await this.items.save(this.items.create({ userId, productId, quantity }));
    }
    return this.get(userId);
  }

  async setQuantity(userId: number, productId: number, quantity: number) {
    const existing = await this.items.findOne({ where: { userId, productId } });
    if (!existing) throw new NotFoundException('Item is not in the cart');
    this.assertStock(await this.getProduct(productId), quantity);
    existing.quantity = quantity;
    await this.items.save(existing);
    return this.get(userId);
  }

  async removeItem(userId: number, productId: number) {
    await this.items.delete({ userId, productId });
    return this.get(userId);
  }

  async clear(userId: number) {
    await this.items.delete({ userId });
  }

  private async getProduct(productId: number) {
    const product = await this.products.findOne({ where: { id: productId } });
    if (!product) throw new NotFoundException('Product not found');
    return product;
  }

  private assertStock(product: Product, quantity: number) {
    if (quantity > product.stock) {
      throw new ConflictException(
        `Only ${product.stock} of "${product.name}" left in stock`,
      );
    }
  }
}
