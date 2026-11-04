import { Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { AppConfig } from './config/configuration';
import { setupApp, setupSwagger } from './setup-app';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  setupApp(app);
  setupSwagger(app);

  const config = app.get<ConfigService<AppConfig, true>>(ConfigService);
  const port = config.get('port', { infer: true });
  await app.listen(port);
  new Logger('Bootstrap').log(
    `ShopLab API on http://localhost:${port}/api (docs: /api/docs)`,
  );
}
void bootstrap();
