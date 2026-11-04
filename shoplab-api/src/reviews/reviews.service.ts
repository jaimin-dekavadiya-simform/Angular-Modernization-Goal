import { Injectable, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { sleep } from '../common/sleep';
import { AppConfig } from '../config/configuration';
import { Product } from '../products/product.entity';
import { CreateReviewDto } from './dto/review.dto';
import { Review } from './review.entity';

@Injectable()
export class ReviewsService {
  constructor(
    @InjectRepository(Review) private readonly reviews: Repository<Review>,
    @InjectRepository(Product) private readonly products: Repository<Product>,
    private readonly config: ConfigService<AppConfig, true>,
  ) {}

  /** Deliberately slow (REVIEWS_DELAY_MS) so the UI can practice `@defer`. */
  async list(productId: number) {
    await this.assertProduct(productId);
    await sleep(this.config.get('reviewsDelayMs', { infer: true }));
    return this.reviews.find({
      where: { productId },
      order: { createdAt: 'DESC', id: 'DESC' },
    });
  }

  async create(
    user: { id: number; name: string },
    productId: number,
    dto: CreateReviewDto,
  ) {
    await this.assertProduct(productId);
    const review = await this.reviews.save(
      this.reviews.create({
        productId,
        userId: user.id,
        authorName: user.name,
        rating: dto.rating,
        comment: dto.comment,
      }),
    );
    await this.recomputeRating(productId);
    return review;
  }

  async recomputeRating(productId: number) {
    const raw = await this.reviews
      .createQueryBuilder('r')
      .select('AVG(r.rating)', 'avg')
      .addSelect('COUNT(r.id)', 'count')
      .where('r.productId = :productId', { productId })
      .getRawOne<{ avg: string | number | null; count: string | number }>();
    await this.products.update(productId, {
      rating: Math.round(Number(raw?.avg ?? 0) * 10) / 10,
      reviewCount: Number(raw?.count ?? 0),
    });
  }

  private async assertProduct(productId: number) {
    if (!(await this.products.exists({ where: { id: productId } }))) {
      throw new NotFoundException('Product not found');
    }
  }
}
