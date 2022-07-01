import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
// import * as request from 'supertest';
import { UserModule } from '../src/user/user.module';

describe('User (e2e)', () => {
  let app: INestApplication;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [UserModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  // it('/user (GET)', () => {
  //   return request(app.getHttpServer()).get('/user').expect(200);
  // });

  // it('/user/:id (GET)', () => {
  //   return request(app.getHttpServer()).get('/user/1').expect(200);
  // });

  // it('/user (POST)', () => {
  //   return request(app.getHttpServer()).post('/user').expect(200);
  // });

  // it('/user/:id (PATCH)', () => {
  //   return request(app.getHttpServer()).patch('/user/1').expect(200);
  // });

  // it('/user/:id (DELETE)', () => {
  //   return request(app.getHttpServer()).delete('/user/1').expect(200);
  // });
});
