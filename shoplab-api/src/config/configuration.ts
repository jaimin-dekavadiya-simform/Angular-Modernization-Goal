export default () => ({
  port: parseInt(process.env.PORT ?? '3000', 10),
  publicUrl:
    process.env.PUBLIC_URL ?? `http://localhost:${process.env.PORT ?? '3000'}`,
  corsOrigins: (process.env.CORS_ORIGINS ?? 'http://localhost:4200')
    .split(',')
    .map((origin) => origin.trim()),
  db: {
    type: process.env.DB_TYPE ?? 'sqlite',
    path: process.env.DB_PATH ?? 'data/shoplab.sqlite',
    url: process.env.DATABASE_URL,
    sync: (process.env.DB_SYNC ?? 'true') === 'true',
  },
  jwt: {
    accessSecret: process.env.JWT_ACCESS_SECRET ?? 'dev-access-secret',
    refreshSecret: process.env.JWT_REFRESH_SECRET ?? 'dev-refresh-secret',
    accessTtl: parseInt(process.env.ACCESS_TTL_SECONDS ?? '900', 10),
    refreshTtl: parseInt(process.env.REFRESH_TTL_SECONDS ?? '604800', 10),
  },
  chaosEnabled: process.env.CHAOS_ENABLED === 'true',
  reviewsDelayMs: parseInt(process.env.REVIEWS_DELAY_MS ?? '1500', 10),
  stockTicker: process.env.STOCK_TICKER === 'true',
});

export type AppConfig = ReturnType<typeof import('./configuration').default>;
