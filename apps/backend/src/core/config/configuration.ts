export default () => {
  if (!process.env.JWT_SECRET) {
    throw new Error('JWT_SECRET environment variable is required');
  }
  if (!process.env.JWT_REFRESH_SECRET) {
    throw new Error('JWT_REFRESH_SECRET environment variable is required');
  }
  return {
    port: parseInt(process.env.PORT || '3000', 10),
    database: { url: process.env.DATABASE_URL },
    jwt: { secret: process.env.JWT_SECRET, expiresIn: process.env.JWT_EXPIRATION || '15m' },
    jwtRefresh: { secret: process.env.JWT_REFRESH_SECRET, expiresIn: process.env.JWT_REFRESH_EXPIRATION || '7d' },
    redis: { host: process.env.REDIS_HOST || 'localhost', port: parseInt(process.env.REDIS_PORT || '6379', 10) },
    meilisearch: { host: process.env.MEILISEARCH_HOST || 'localhost', port: parseInt(process.env.MEILISEARCH_PORT || '7700', 10), apiKey: process.env.MEILISEARCH_API_KEY },
  };
};
