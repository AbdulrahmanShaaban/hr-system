import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import supertest from 'supertest';
import { AppModule } from '../src/app.module';

describe('App E2E', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.setGlobalPrefix('api/v1');
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
        transformOptions: { enableImplicitConversion: true },
      }),
    );
    await app.init();
  }, 30000);

  afterAll(async () => {
    await app.close();
  });

  describe('Auth', () => {
    it('POST /api/v1/auth/login - returns 401 for invalid credentials', () => {
      return supertest(app.getHttpServer())
        .post('/api/v1/auth/login')
        .send({ email: 'nonexistent@example.com', password: 'wrongpassword' })
        .expect(401);
    });

    it('POST /api/v1/auth/login - returns 400 for missing fields', () => {
      return supertest(app.getHttpServer())
        .post('/api/v1/auth/login')
        .send({ email: 'test@example.com' })
        .expect(400);
    });

    it('GET /api/v1/auth/me - returns 401 without token', () => {
      return supertest(app.getHttpServer()).get('/api/v1/auth/me').expect(401);
    });

    it('GET /api/v1/auth/me - returns 401 with invalid token', () => {
      return supertest(app.getHttpServer())
        .get('/api/v1/auth/me')
        .set('Authorization', 'Bearer invalid-token')
        .expect(401);
    });
  });

  describe('Tenants', () => {
    it('POST /api/v1/tenants - requires authentication', () => {
      return supertest(app.getHttpServer())
        .post('/api/v1/tenants')
        .send({ name: 'Test Tenant', slug: 'test-tenant' })
        .expect(401);
    });
  });

  describe('Employees', () => {
    it('GET /api/v1/employees - requires authentication', () => {
      return supertest(app.getHttpServer()).get('/api/v1/employees').expect(401);
    });
  });

  describe('Health', () => {
    it('GET / - should return 200 or 404', () => {
      return supertest(app.getHttpServer()).get('/').expect((res) => {
        expect([200, 404]).toContain(res.status);
      });
    });
  });
});
