const { NestFactory } = require('@nestjs/core');
const { ExpressAdapter } = require('@nestjs/platform-express');
const express = require('express');
const helmet = require('helmet');
const cookieParser = require('cookie-parser');

let cachedApp;

async function getApp() {
  if (cachedApp) return cachedApp;
  const { AppModule } = require('../dist/app.module');
  const expressApp = express();
  const app = await NestFactory.create(AppModule, new ExpressAdapter(expressApp));
  app.use(cookieParser());
  app.use(helmet());
  app.setGlobalPrefix('api/v1');
  const corsOrigins = (process.env.CORS_ORIGIN || '*')
    .split(',')
    .map((o) => o.trim());
  app.enableCors({
    origin: corsOrigins.length === 1 ? corsOrigins[0] : corsOrigins,
    credentials: true,
    exposedHeaders: ['Set-Cookie'],
  });
  const { ValidationPipe } = require('@nestjs/common');
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    // Must match src/main.ts: strip unknown props instead of 400 so
    // richer frontend payloads don't break production mutations.
    forbidNonWhitelisted: false,
    transform: true,
    transformOptions: { enableImplicitConversion: true },
  }));
  await app.init();
  cachedApp = expressApp;
  return expressApp;
}

module.exports = async (req, res) => {
  try {
    const expressApp = await getApp();
    expressApp(req, res);
  } catch (err) {
    console.error('Function error:', err);
    res.status(500).json({ error: 'Internal Server Error', message: err.message });
  }
};
