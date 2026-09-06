import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import helmet from 'helmet';
import { ExpressAdapter } from '@nestjs/platform-express';
import express from 'express';
import cookieParser from 'cookie-parser';
import * as crypto from 'crypto';
import { AppModule } from './app.module';

const expressApp = express();

// CSRF middleware: generates token on GET requests, validates on state-changing requests
function csrfMiddleware(req: express.Request, res: express.Response, next: express.NextFunction) {
  // Skip CSRF for GET/HEAD/OPTIONS and public paths
  if (req.method === 'GET' || req.method === 'HEAD' || req.method === 'OPTIONS') {
    // Ensure CSRF cookie exists
    if (!req.cookies?.csrf_token) {
      const token = crypto.randomBytes(32).toString('hex');
      res.cookie('csrf_token', token, {
        httpOnly: false,
        secure: process.env.NODE_ENV === 'production' || !!process.env.VERCEL,
        sameSite: (process.env.NODE_ENV === 'production' || !!process.env.VERCEL) ? 'none' : 'lax',
        path: '/',
        maxAge: 24 * 60 * 60 * 1000,
      });
    }
    return next();
  }

  // Validate CSRF on state-changing requests
  const csrfFromCookie = req.cookies?.csrf_token;
  const csrfFromHeader = req.headers['x-csrf-token'];

  if (!csrfFromCookie || !csrfFromHeader || csrfFromCookie !== csrfFromHeader) {
    return res.status(403).json({ message: 'CSRF token mismatch' });
  }

  next();
}

async function bootstrap() {
  const app = await NestFactory.create(AppModule, new ExpressAdapter(expressApp));

  // Parse cookies before CSRF
  app.use(cookieParser());

  app.use(helmet());
  app.setGlobalPrefix('api/v1');

  const corsOrigins = (process.env.CORS_ORIGIN || 'http://localhost:3000')
    .split(',')
    .map((o) => o.trim());

  app.enableCors({
    origin: corsOrigins.length === 1 ? corsOrigins[0] : corsOrigins,
    credentials: true,
    exposedHeaders: ['Set-Cookie'],
  });

  // CSRF protection
  app.use(csrfMiddleware);

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  const config = new DocumentBuilder()
    .setTitle('Qawam HR & Payroll API')
    .setDescription('Qawam HR & Payroll System - Backend API')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  await app.init();

  if (!process.env.VERCEL) {
    const port = process.env.PORT || 4000;
    await app.listen(port);
    console.log(`Qawam Backend running on: http://localhost:${port}`);
    console.log(`Swagger docs: http://localhost:${port}/api/docs`);
  }
}

const appReady = bootstrap();

if (process.env.VERCEL) {
  module.exports = appReady.then(() => expressApp);
} else {
  appReady.catch(console.error);
}
