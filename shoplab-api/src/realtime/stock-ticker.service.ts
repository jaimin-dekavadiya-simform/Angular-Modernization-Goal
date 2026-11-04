import {
  Injectable,
  Logger,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AppConfig } from '../config/configuration';
import { Product } from '../products/product.entity';
import { RealtimeGateway } from './realtime.gateway';

/** With STOCK_TICKER=true, randomly changes one product's stock every 3s. */
@Injectable()
export class StockTickerService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(StockTickerService.name);
  private timer?: NodeJS.Timeout;

  constructor(
    @InjectRepository(Product) private readonly products: Repository<Product>,
    private readonly gateway: RealtimeGateway,
    private readonly config: ConfigService<AppConfig, true>,
  ) {}

  onModuleInit() {
    if (!this.config.get('stockTicker', { infer: true })) return;
    this.logger.log('Stock ticker enabled (every 3s)');
    this.timer = setInterval(() => void this.tick(), 3000);
  }

  onModuleDestroy() {
    if (this.timer) clearInterval(this.timer);
  }

  private async tick() {
    try {
      const count = await this.products.count();
      if (!count) return;
      const [product] = await this.products.find({
        skip: Math.floor(Math.random() * count),
        take: 1,
      });
      if (!product) return;
      product.stock = Math.max(
        0,
        product.stock + Math.floor(Math.random() * 9) - 3,
      );
      await this.products.save(product);
      this.gateway.emitStockUpdated(product.id, product.stock);
    } catch (error) {
      this.logger.warn(`tick failed: ${(error as Error).message}`);
    }
  }
}
