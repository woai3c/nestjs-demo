import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '@/app.module';
import { TEST_USER_NAME, TEST_USER_PASSWORD } from '@/modules/auth/constants';

describe('AuthController (e2e)', () => {
  let app: INestApplication;
  let accessToken: string; // 用于存储获得的访问令牌
  let refreshToken: string; // 用于存储获得的刷新令牌

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    // 执行登录以获取令牌
    const response = await request(app.getHttpServer())
      .post('/auth/register')
      .send({ username: TEST_USER_NAME, password: TEST_USER_PASSWORD })
      .expect(201);

    accessToken = response.body.access_token;
    refreshToken = response.body.refresh_token;
  });

  afterAll(async () => {
    await request(app.getHttpServer())
      .delete('/auth/delete-user')
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200);

    await app.close();
  });

  it('/auth/login (POST)', () => {
    return request(app.getHttpServer())
      .post('/auth/login')
      .send({ username: TEST_USER_NAME, password: TEST_USER_PASSWORD })
      .expect(201);
  });

  it('/auth/profile (GET)', () => {
    return request(app.getHttpServer())
      .get('/auth/profile')
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200);
  });

  it('/auth/refresh (POST)', () => {
    return request(app.getHttpServer())
      .post('/auth/refresh')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ refreshToken })
      .expect(201);
  });

  it('/auth/revise-password (PUT)', () => {
    return request(app.getHttpServer())
      .put('/auth/revise-password')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ oldPassword: TEST_USER_PASSWORD, newPassword: 'Ab222222' })
      .expect(200);
  });

  // Test invalid login
  it('/auth/login (POST) with invalid password', () => {
    return request(app.getHttpServer())
      .post('/auth/login')
      .send({ username: TEST_USER_NAME, password: 'wrongpassword' })
      .expect(401); // Expect an unauthorized error
  });

  // Test profile without authorization
  it('/auth/profile (GET) without authorization', () => {
    return request(app.getHttpServer()).get('/auth/profile').expect(401); // Expect an unauthorized error
  });

  // Test refresh with error authorization
  it('/auth/refresh (POST) without authorization', () => {
    return request(app.getHttpServer())
      .post('/auth/refresh')
      .set('Authorization', `Bearer invalidToken`)
      .expect(401); // Expect an unauthorized error
  });

  // Test delete user without authorization
  it('/auth/delete-user (DELETE) without authorization', () => {
    return request(app.getHttpServer()).delete('/auth/delete-user').expect(401); // Expect an unauthorized error
  });
});
