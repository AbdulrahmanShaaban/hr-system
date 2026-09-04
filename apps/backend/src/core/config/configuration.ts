export default () => ({
  port: parseInt(process.env.PORT || '3000', 10),
  database: { url: process.env.DATABASE_URL },
  jwt: { secret: process.env.JWT_SECRET || 'qawam-dev-secret', expiresIn: '15m' },
  jwtRefresh: { secret: process.env.JWT_REFRESH_SECRET || 'qawam-refresh-secret', expiresIn: '7d' },
  redis: { host: process.env.REDIS_HOST || 'localhost', port: parseInt(process.env.REDIS_PORT || '6379', 10) },
  meilisearch: { host: process.env.MEILISEARCH_HOST || 'localhost', port: parseInt(process.env.MEILISEARCH_PORT || '7700', 10), apiKey: process.env.MEILISEARCH_API_KEY },
});
