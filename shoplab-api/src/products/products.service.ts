import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { paginated } from '../common/dto/pagination-query.dto';
import { slugify } from '../common/slugify';
import { RealtimeGateway } from '../realtime/realtime.gateway';
import {
  CreateProductDto,
  ProductQueryDto,
  ProductSort,
  UpdateProductDto,
} from './dto/product.dto';
import { Product } from './product.entity';

const SORTS: Record<ProductSort, [string, 'ASC' | 'DESC']> = {
  newest: ['p.createdAt', 'DESC'],
  price: ['p.price', 'ASC'],
  '-price': ['p.price', 'DESC'],
  name: ['p.name', 'ASC'],
  '-name': ['p.name', 'DESC'],
  rating: ['p.rating', 'ASC'],
  '-rating': ['p.rating', 'DESC'],
};

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product) private readonly products: Repository<Product>,
    private readonly realtime: RealtimeGateway,
  ) {}

  async list(query: ProductQueryDto) {
    const qb = this.products
      .createQueryBuilder('p')
      .leftJoinAndSelect('p.category', 'c');

    if (query.search) {
      qb.andWhere('(LOWER(p.name) LIKE :s OR LOWER(p.description) LIKE :s)', {
        s: `%${query.search.toLowerCase()}%`,
      });
    }
    if (query.category)
      qb.andWhere('c.slug = :category', { category: query.category });
    if (query.minPrice !== undefined)
      qb.andWhere('p.price >= :min', { min: query.minPrice });
    if (query.maxPrice !== undefined)
      qb.andWhere('p.price <= :max', { max: query.maxPrice });

    const [column, direction] = SORTS[query.sort];
    qb.orderBy(column, direction).addOrderBy('p.id', 'ASC');
    qb.skip((query.page - 1) * query.limit).take(query.limit);

    const [rows, total] = await qb.getManyAndCount();
    return paginated(rows, total, query.page, query.limit);
  }

  async findOne(id: number) {
    const product = await this.products.findOne({
      where: { id },
      relations: { category: true },
    });
    if (!product) throw new NotFoundException('Product not found');
    return product;
  }

  async create(dto: CreateProductDto) {
    const slug = await this.uniqueSlug(dto.name);
    const product = await this.products.save(
      this.products.create({
        ...dto,
        slug,
        imageUrl: dto.imageUrl ?? null,
        categoryId: dto.categoryId ?? null,
        images: dto.imageUrl ? [{ width: 800, url: dto.imageUrl }] : [],
      }),
    );
    return this.findOne(product.id);
  }

  async update(id: number, dto: UpdateProductDto) {
    const product = await this.findOne(id);
    const stockBefore = product.stock;
    Object.assign(product, dto);
    if (dto.name && dto.name !== product.name)
      product.slug = await this.uniqueSlug(dto.name, id);
    await this.products.save(product);
    if (product.stock !== stockBefore) {
      this.realtime.emitStockUpdated(product.id, product.stock);
    }
    return this.findOne(id);
  }

  async remove(id: number) {
    const result = await this.products.delete(id);
    if (!result.affected) throw new NotFoundException('Product not found');
  }

  private async uniqueSlug(name: string, ignoreId?: number) {
    const base = slugify(name);
    let slug = base;
    for (let n = 2; ; n++) {
      const existing = await this.products.findOne({ where: { slug } });
      if (!existing || existing.id === ignoreId) return slug;
      slug = `${base}-${n}`;
    }
  }
}
