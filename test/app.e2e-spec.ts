import { AppModule } from '@/app.module';
import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import * as request from 'supertest';

describe('AppController (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('/ (GET) should return Hello World', async () => {
    const response = await request(app.getHttpServer()).get('/');

    expect(response.status).toBe(200);
    expect(response.text).toBe('Hello World!');
  });

  // Example of how you might test another endpoint if you have one
  // it('/health (GET) should return OK', async () => {
  //   const response = await request(app.getHttpServer())
  //     .get('/health');
  //   expect(response.status).toBe(200);
  //   expect(response.body).toEqual({ status: 'ok' });
  // });
});
