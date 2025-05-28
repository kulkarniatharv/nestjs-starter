import { AppModule } from '@/app.module';
import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';

describe('UserController (e2e)', () => {
  let app: INestApplication;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterEach(async () => {
    await app.close();
  });

  it('/users (GET) should return 404 for non-existent user', () => {
    return request(app.getHttpServer()).get('/users/non-existent-id').expect(404);
  });

  it('/users/webhooks/clerk (POST) should require webhook headers', () => {
    return request(app.getHttpServer()).post('/users/webhooks/clerk').expect(400);
  });
});
