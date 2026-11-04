import { join } from 'node:path';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { ServeStaticModule } from '@nestjs/serve-static';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './auth/auth.module';
import { JwtAuthGuard } from './auth/jwt-auth.guard';
import { RolesGuard } from './auth/roles.guard';
import { CartModule } from './cart/cart.module';
import { CategoriesModule } from './categories/categories.module';
import { ChaosInterceptor } from './common/chaos.interceptor';
import configuration, { AppConfig } from './config/configuration';
import { databaseConfig } from './database/database.config';
import { HealthController } from './health/health.controller';
import { OrdersModule } from './orders/orders.module';
import { ProductsModule } from './products/products.module';
import { RealtimeModule } from './realtime/realtime.module';
import { ReviewsModule } from './reviews/reviews.module';
import { UsersModule } from './users/users.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, load: [configuration] }),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService<AppConfig, true>) =>
        databaseConfig(config),
    }),
    ThrottlerModule.forRoot([{ ttl: 60_000, limit: 600 }]),
    ServeStaticModule.forRoot({
      rootPath: join(process.cwd(), 'public', 'images'),
      serveRoot: '/images',
    }),
    UsersModule,
    AuthModule,
    CategoriesModule,
    ProductsModule,
    ReviewsModule,
    CartModule,
    OrdersModule,
    RealtimeModule,
  ],
  controllers: [HealthController],
  providers: [
    { provide: APP_GUARD, useClass: ThrottlerGuard },
    { provide: APP_GUARD, useClass: JwtAuthGuard },
    { provide: APP_GUARD, useClass: RolesGuard },
    { provide: APP_INTERCEPTOR, useClass: ChaosInterceptor },
  ],
})
export class AppModule {}
