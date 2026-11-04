import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import * as bcrypt from 'bcrypt';
import request from 'supertest';
import { DataSource } from 'typeorm';
import { AppModule } from '../src/app.module';
import { Role } from '../src/common/enums';
import { setupApp } from '../src/setup-app';
import { Category } from '../src/categories/category.entity';
import { Product } from '../src/products/product.entity';
import { User } from '../src/users/user.entity';

const address = {
  fullName: 'Demo User',
  line1: '1 Main St',
  city: 'Pune',
  postalCode: '411001',
  country: 'India',
};
const goodCard = {
  cardNumber: '4242424242424242',
  expiry: '12/30',
  cvc: '123',
};

describe('ShopLab API (e2e)', () => {
  let app: INestApplication;
  let http: ReturnType<typeof request>;
  let productId: number;
  let adminToken: string;

  beforeAll(async () => {
    process.env.DB_TYPE = 'sqlite';
    process.env.DB_PATH = ':memory:';
    process.env.CHAOS_ENABLED = 'false';
    process.env.REVIEWS_DELAY_MS = '0';

    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
    app = moduleRef.createNestApplication();
    setupApp(app);
    await app.init();
    http = request(app.getHttpServer());

    const ds = app.get(DataSource);
    await ds.getRepository(User).save({
      email: 'admin@test.io',
      name: 'Admin',
      role: Role.Admin,
      passwordHash: await bcrypt.hash('Admin123!', 4),
      refreshTokenHash: null,
    });
    const category = await ds
      .getRepository(Category)
      .save({ name: 'Gadgets', slug: 'gadgets' });
    const product = await ds.getRepository(Product).save({
      name: 'Test Gadget',
      slug: 'test-gadget',
      description: 'A gadget for tests',
      price: 20,
      stock: 5,
      imageUrl: null,
      images: [],
      categoryId: category.id,
    });
    productId = product.id;

    const login = await http
      .post('/api/auth/login')
      .send({ email: 'admin@test.io', password: 'Admin123!' });
    adminToken = login.body.accessToken;
  });

  afterAll(async () => {
    await app.close();
  });

  it('GET /health is public', async () => {
    await http
      .get('/api/health')
      .expect(200)
      .expect(({ body }) => expect(body.status).toBe('ok'));
  });

  it('lists and filters products without auth', async () => {
    const res = await http
      .get('/api/products?search=gadget&category=gadgets')
      .expect(200);
    expect(res.body.meta.total).toBe(1);
    expect(res.body.data[0].category.slug).toBe('gadgets');
  });

  it('rejects the cart without a token', async () => {
    await http.get('/api/cart').expect(401);
  });

  it('validates registration input', async () => {
    await http
      .post('/api/auth/register')
      .send({ email: 'nope', password: '1', name: '' })
      .expect(400);
  });

  describe('customer journey: register → cart → checkout', () => {
    let token: string;

    it('registers and gets tokens', async () => {
      const res = await http
        .post('/api/auth/register')
        .send({ email: 'jane@test.io', password: 'password1', name: 'Jane' })
        .expect(201);
      token = res.body.accessToken;
      expect(res.body.user.role).toBe('customer');
    });

    it('adds to the cart and refuses to exceed stock', async () => {
      const auth = { Authorization: `Bearer ${token}` };
      const ok = await http
        .post('/api/cart/items')
        .set(auth)
        .send({ productId, quantity: 2 })
        .expect(201);
      expect(ok.body.total).toBe(40);
      await http
        .post('/api/cart/items')
        .set(auth)
        .send({ productId, quantity: 10 })
        .expect(409);
    });

    it('declines card numbers ending in 0002 with 402 and keeps the cart', async () => {
      const auth = { Authorization: `Bearer ${token}` };
      await http
        .post('/api/orders')
        .set(auth)
        .send({
          shippingAddress: address,
          payment: { ...goodCard, cardNumber: '4242424242420002' },
        })
        .expect(402);
      const cart = await http.get('/api/cart').set(auth).expect(200);
      expect(cart.body.itemCount).toBe(2);
    });

    it('checks out, decrements stock and empties the cart', async () => {
      const auth = { Authorization: `Bearer ${token}` };
      const order = await http
        .post('/api/orders')
        .set(auth)
        .send({ shippingAddress: address, payment: goodCard })
        .expect(201);
      expect(order.body.total).toBe(40);
      expect(order.body.paymentLast4).toBe('4242');
      expect(order.body.items).toHaveLength(1);

      const product = await http.get(`/api/products/${productId}`).expect(200);
      expect(product.body.stock).toBe(3);
      const cart = await http.get('/api/cart').set(auth).expect(200);
      expect(cart.body.itemCount).toBe(0);

      const mine = await http.get('/api/orders').set(auth).expect(200);
      expect(mine.body).toHaveLength(1);
    });

    it('rejects checkout with an empty cart', async () => {
      await http
        .post('/api/orders')
        .set({ Authorization: `Bearer ${token}` })
        .send({ shippingAddress: address, payment: goodCard })
        .expect(400);
    });

    it('forbids customers from admin routes', async () => {
      const auth = { Authorization: `Bearer ${token}` };
      await http
        .post('/api/products')
        .set(auth)
        .send({ name: 'x', description: 'xx', price: 1, stock: 1 })
        .expect(403);
      await http.get('/api/admin/orders').set(auth).expect(403);
    });
  });

  describe('admin', () => {
    it('creates a product and cancelling an order restocks it', async () => {
      const auth = { Authorization: `Bearer ${adminToken}` };
      const created = await http
        .post('/api/products')
        .set(auth)
        .send({
          name: 'Admin Widget',
          description: 'made by admin',
          price: 5,
          stock: 2,
        })
        .expect(201);
      expect(created.body.slug).toBe('admin-widget');

      const orders = await http.get('/api/admin/orders').set(auth).expect(200);
      const orderId = orders.body.data[0].id;
      await http
        .patch(`/api/admin/orders/${orderId}/status`)
        .set(auth)
        .send({ status: 'cancelled' })
        .expect(200);
      const product = await http.get(`/api/products/${productId}`).expect(200);
      expect(product.body.stock).toBe(5);
      await http
        .patch(`/api/admin/orders/${orderId}/status`)
        .set(auth)
        .send({ status: 'shipped' })
        .expect(409);
    });
  });

  it('keeps the refresh flow working end to end', async () => {
    const login = await http
      .post('/api/auth/login')
      .send({ email: 'admin@test.io', password: 'Admin123!' })
      .expect(200);
    const refreshed = await http
      .post('/api/auth/refresh')
      .send({ refreshToken: login.body.refreshToken })
      .expect(200);
    expect(refreshed.body.accessToken).toBeTruthy();
    await http
      .post('/api/auth/refresh')
      .send({ refreshToken: login.body.refreshToken })
      .expect(401);
  });
});
