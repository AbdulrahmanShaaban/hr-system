const { NestFactory } = require('@nestjs/core');
const { ExpressAdapter } = require('@nestjs/platform-express');
const express = require('express');
const helmet = require('helmet');

let cachedApp;

async function getApp() {
  if (cachedApp) return cachedApp;
  const { AppModule } = require('../dist/app.module');
  const expressApp = express();
  const app = await NestFactory.create(AppModule, new ExpressAdapter(expressApp));
  app.use(helmet());
  app.setGlobalPrefix('api/v1');
  app.enableCors({
    origin: process.env.CORS_ORIGIN || '*',
    credentials: true,
  });
  const { ValidationPipe } = require('@nestjs/common');
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
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
