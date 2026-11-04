import { mkdirSync } from 'node:fs';
import { dirname } from 'node:path';
import { ConfigService } from '@nestjs/config';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { AppConfig } from '../config/configuration';

export function databaseConfig(
  config: ConfigService<AppConfig, true>,
): TypeOrmModuleOptions {
  const db = config.get('db', { infer: true });

  if (db.type === 'postgres') {
    return {
      type: 'postgres',
      url: db.url,
      autoLoadEntities: true,
      synchronize: db.sync,
    };
  }

  if (db.path !== ':memory:') {
    mkdirSync(dirname(db.path), { recursive: true });
  }
  return {
    type: 'better-sqlite3',
    database: db.path,
    autoLoadEntities: true,
    synchronize: db.sync,
  };
}
