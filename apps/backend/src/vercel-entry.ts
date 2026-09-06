import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { ExpressAdapter } from '@nestjs/platform-express';
import helmet from 'helmet';
import express from 'express';
import { AppModule } from './app.module';

let cachedServer: express.Express;

async function bootstrap(): Promise<express.Express> {
  const app = await NestFactory.create(
    AppModule,
    new ExpressAdapter(),
    { cors: false },
  );

  app.use(helmet());
  app.setGlobalPrefix('api/v1');

  const corsOrigins = (process.env.CORS_ORIGIN || 'http://localhost:3000')
    .split(',')
    .map((o: string) => o.trim());

  console.log('[CORS] Allowed origins:', corsOrigins);

  app.enableCors({
    origin: corsOrigins.length === 1 ? corsOrigins[0] : corsOrigins,
    credentials: true,
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );

  await app.init();
  return app.getHttpAdapter().getInstance();
}

export default async function handler(req: any, res: any) {
  if (!cachedServer) {
    cachedServer = await bootstrap();
  }
  return cachedServer(req, res);
}
