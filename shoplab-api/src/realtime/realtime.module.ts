import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Product } from '../products/product.entity';
import { RealtimeGateway } from './realtime.gateway';
import { StockTickerService } from './stock-ticker.service';

@Module({
  imports: [JwtModule.register({}), TypeOrmModule.forFeature([Product])],
  providers: [RealtimeGateway, StockTickerService],
  exports: [RealtimeGateway],
})
export class RealtimeModule {}
