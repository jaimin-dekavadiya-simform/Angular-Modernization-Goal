import { INestApplication, ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppConfig } from './config/configuration';

/** Shared by main.ts and the e2e tests so both run with identical behaviour. */
export function setupApp(app: INestApplication) {
  const config = app.get<ConfigService<AppConfig, true>>(ConfigService);

  app.setGlobalPrefix('api');
  app.enableCors({
    origin: config.get('corsOrigins', { infer: true }),
    credentials: true,
  });
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
}

export function setupSwagger(app: INestApplication) {
  const document = SwaggerModule.createDocument(
    app,
    new DocumentBuilder()
      .setTitle('ShopLab API')
      .setDescription('Backend for the Angular practice project')
      .setVersion('1.0')
      .addBearerAuth()
      .build(),
  );
  SwaggerModule.setup('api/docs', app, document);
}
