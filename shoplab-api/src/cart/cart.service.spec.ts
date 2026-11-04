import { ConflictException, NotFoundException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { Product } from '../products/product.entity';
import { CartItem } from './cart-item.entity';
import { CartService } from './cart.service';

describe('CartService', () => {
  let service: CartService;
  let items: CartItem[];
  const products: Product[] = [
    { id: 1, name: 'Mug', price: 10.5, stock: 5 } as Product,
    { id: 2, name: 'Pen', price: 2, stock: 1 } as Product,
  ];

  beforeEach(() => {
    items = [];
    const itemRepo = {
      find: async ({ where }: { where: { userId: number } }) =>
        items.filter((i) => i.userId === where.userId),
      findOne: async ({
        where,
      }: {
        where: { userId: number; productId: number };
      }) =>
        items.find(
          (i) => i.userId === where.userId && i.productId === where.productId,
        ) ?? null,
      create: (data: Partial<CartItem>) => ({ ...data }) as CartItem,
      save: async (item: CartItem) => {
        if (!items.includes(item)) {
          item.product = products.find((p) => p.id === item.productId)!;
          items.push(item);
        }
        return item;
      },
      delete: async () => undefined,
    } as unknown as Repository<CartItem>;
    const productRepo = {
      findOne: async ({ where }: { where: { id: number } }) =>
        products.find((p) => p.id === where.id) ?? null,
    } as unknown as Repository<Product>;
    service = new CartService(itemRepo, productRepo);
  });

  it('adds items and computes totals', async () => {
    await service.addItem(1, 1, 2);
    const cart = await service.addItem(1, 2, 1);
    expect(cart.itemCount).toBe(3);
    expect(cart.total).toBe(23);
  });

  it('merges quantities for the same product', async () => {
    await service.addItem(1, 1, 2);
    const cart = await service.addItem(1, 1, 1);
    expect(cart.items).toHaveLength(1);
    expect(cart.items[0].quantity).toBe(3);
  });

  it('refuses to exceed stock', async () => {
    await expect(service.addItem(1, 2, 2)).rejects.toBeInstanceOf(
      ConflictException,
    );
  });

  it('404s for unknown products', async () => {
    await expect(service.addItem(1, 99, 1)).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });
});
