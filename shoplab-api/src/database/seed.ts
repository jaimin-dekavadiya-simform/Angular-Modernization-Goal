import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import * as bcrypt from 'bcrypt';
import { DataSource } from 'typeorm';
import { AppModule } from '../app.module';
import { Role } from '../common/enums';
import { slugify } from '../common/slugify';
import { AppConfig } from '../config/configuration';
import { Category } from '../categories/category.entity';
import { Product } from '../products/product.entity';
import { Review } from '../reviews/review.entity';
import { User } from '../users/user.entity';

const CATALOG: Record<string, { hue: number; items: string[] }> = {
  Electronics: {
    hue: 215,
    items: [
      'Wireless Headphones',
      'Mechanical Keyboard',
      '4K Monitor',
      'USB-C Hub',
      'Bluetooth Speaker',
      'Webcam HD',
      'Portable SSD 1TB',
      'Smart Watch',
    ],
  },
  'Home & Kitchen': {
    hue: 25,
    items: [
      'Cast Iron Skillet',
      'Pour-Over Coffee Set',
      'Chef Knife',
      'Glass Storage Jars',
      'Electric Kettle',
      'Bamboo Cutting Board',
      'Ceramic Dinner Set',
      'Air Fryer',
    ],
  },
  Books: {
    hue: 350,
    items: [
      'TypeScript in Depth',
      'Clean Architecture',
      'The Pragmatic Programmer',
      'Designing Data Apps',
      'Refactoring',
      'Domain-Driven Design',
      'Web Performance Handbook',
      'Testing Angular',
    ],
  },
  Sports: {
    hue: 140,
    items: [
      'Yoga Mat',
      'Adjustable Dumbbells',
      'Running Shoes',
      'Resistance Bands',
      'Water Bottle 1L',
      'Jump Rope',
      'Foam Roller',
      'Cycling Gloves',
    ],
  },
  Toys: {
    hue: 280,
    items: [
      'Building Blocks Set',
      'Wooden Puzzle',
      'RC Car',
      'Board Game Classic',
      'Plush Bear',
      'Science Kit',
      'Art Supplies Box',
      'Kite',
    ],
  },
  Fashion: {
    hue: 190,
    items: [
      'Denim Jacket',
      'Canvas Backpack',
      'Wool Scarf',
      'Leather Wallet',
      'Sunglasses',
      'Cotton T-Shirt',
      'Baseball Cap',
      'Analog Watch',
    ],
  },
};

const COMMENTS = [
  'Exactly what I needed, arrived quickly.',
  'Good quality for the price.',
  'Does the job, nothing fancy.',
  'Better than I expected, would buy again.',
  'Packaging was damaged but the product is fine.',
  'Stopped working after a month, disappointed.',
  'Great value. Highly recommended!',
  'Solid build and easy to use.',
];

const REVIEWERS = [
  { name: 'Sam Carter', email: 'sam@shoplab.dev' },
  { name: 'Riley Jones', email: 'riley@shoplab.dev' },
  { name: 'Jordan Lee', email: 'jordan@shoplab.dev' },
];

/** Small deterministic PRNG so every seed run produces the same catalog. */
function mulberry32(seed: number) {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const escapeXml = (s: string) =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

function svg(label: string, hue: number, width: number) {
  const height = Math.round((width * 3) / 4);
  const fontSize = Math.round(width / 16);
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
  <defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
    <stop offset="0" stop-color="hsl(${hue},70%,62%)"/><stop offset="1" stop-color="hsl(${(hue + 40) % 360},65%,40%)"/>
  </linearGradient></defs>
  <rect width="100%" height="100%" fill="url(#g)"/>
  <text x="50%" y="50%" fill="#fff" font-family="sans-serif" font-size="${fontSize}" font-weight="700" text-anchor="middle" dominant-baseline="middle">${escapeXml(label)}</text>
</svg>`;
}

async function seed() {
  const app = await NestFactory.createApplicationContext(AppModule, {
    logger: ['error', 'warn'],
  });
  try {
    const dataSource = app.get(DataSource);
    const config = app.get<ConfigService<AppConfig, true>>(ConfigService);
    const publicUrl = config.get('publicUrl', { infer: true });
    const rand = mulberry32(42);

    await dataSource.synchronize(true); // drop + recreate schema

    const imagesDir = join(process.cwd(), 'public', 'images');
    mkdirSync(imagesDir, { recursive: true });

    const users = dataSource.getRepository(User);
    const hash = (pw: string) => bcrypt.hash(pw, 10);
    await users.save([
      users.create({
        email: 'admin@shoplab.dev',
        name: 'Admin',
        role: Role.Admin,
        passwordHash: await hash('Admin123!'),
        refreshTokenHash: null,
      }),
      users.create({
        email: 'user@shoplab.dev',
        name: 'Demo User',
        role: Role.Customer,
        passwordHash: await hash('User123!'),
        refreshTokenHash: null,
      }),
      ...(await Promise.all(
        REVIEWERS.map(async (r) =>
          users.create({
            email: r.email,
            name: r.name,
            role: Role.Customer,
            passwordHash: await hash('User123!'),
            refreshTokenHash: null,
          }),
        ),
      )),
    ]);
    const customers = await users.find({ where: { role: Role.Customer } });

    const categories = dataSource.getRepository(Category);
    const products = dataSource.getRepository(Product);
    const reviews = dataSource.getRepository(Review);

    let productCount = 0;
    for (const [categoryName, { hue, items }] of Object.entries(CATALOG)) {
      const category = await categories.save(
        categories.create({ name: categoryName, slug: slugify(categoryName) }),
      );

      for (const name of items) {
        productCount++;
        const slug = slugify(name);
        const sizes = [400, 800];
        for (const width of sizes) {
          writeFileSync(
            join(imagesDir, `${slug}-${width}.svg`),
            svg(name, hue, width),
          );
        }
        const images = sizes.map((width) => ({
          width,
          url: `${publicUrl}/images/${slug}-${width}.svg`,
        }));

        const price = Math.round((5 + rand() * 195) * 100) / 100;
        const product = await products.save(
          products.create({
            name,
            slug,
            description: `${name}: a well-made ${categoryName.toLowerCase()} item from the ShopLab catalog. Practice data only.`,
            price,
            stock: productCount % 11 === 0 ? 0 : 5 + Math.floor(rand() * 60),
            imageUrl: images[1].url,
            images,
            categoryId: category.id,
          }),
        );

        const reviewCount = Math.floor(rand() * 6);
        let ratingSum = 0;
        for (let i = 0; i < reviewCount; i++) {
          const author = customers[Math.floor(rand() * customers.length)];
          const rating = 1 + Math.floor(rand() * 5);
          ratingSum += rating;
          await reviews.save(
            reviews.create({
              productId: product.id,
              userId: author.id,
              authorName: author.name,
              rating,
              comment: COMMENTS[Math.floor(rand() * COMMENTS.length)],
            }),
          );
        }
        if (reviewCount) {
          await products.update(product.id, {
            rating: Math.round((ratingSum / reviewCount) * 10) / 10,
            reviewCount,
          });
        }
      }
    }

    console.log(
      `Seeded ${Object.keys(CATALOG).length} categories, ${productCount} products, ${customers.length + 1} users.`,
    );
    console.log('  admin: admin@shoplab.dev / Admin123!');
    console.log('  user:  user@shoplab.dev  / User123!');
  } finally {
    await app.close();
  }
}

void seed();
