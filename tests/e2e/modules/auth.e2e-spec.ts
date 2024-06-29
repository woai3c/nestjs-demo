import { Test, TestingModule } from '@nestjs/testing'
import { INestApplication, ValidationPipe } from '@nestjs/common'
import * as request from 'supertest'
import { AppModule } from '@/app.module'
import { TEST_NEW_USER_PASSWORD, TEST_USER_NAME, TEST_USER_NAME2, TEST_USER_PASSWORD } from '@tests/constants'

describe('AuthModule (e2e)', () => {
  let app: INestApplication
  let accessToken: string
  let refreshToken: string

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile()

    app = moduleFixture.createNestApplication()
    app.useGlobalPipes(new ValidationPipe())
    await app.init()

    // 执行登录以获取令牌
    const response = await request(app.getHttpServer())
      .post('/auth/register')
      .send({ username: TEST_USER_NAME, password: TEST_USER_PASSWORD })
      .expect(201)

    accessToken = response.body.access_token
    refreshToken = response.body.refresh_token
  })

  afterAll(async () => {
    await request(app.getHttpServer())
      .delete('/auth/delete-user')
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200)

    await app.close()
  })

  describe('login', () => {
    it('/auth/login (POST)', () => {
      return request(app.getHttpServer())
        .post('/auth/login')
        .send({ username: TEST_USER_NAME, password: TEST_USER_PASSWORD })
        .expect(200)
    })

    it('/auth/login (POST) with user not found', () => {
      return request(app.getHttpServer())
        .post('/auth/login')
        .send({ username: TEST_USER_NAME2, password: TEST_USER_PASSWORD })
        .expect(401) // Expect an unauthorized error
    })

    it('/auth/login (POST) without username or password', async () => {
      await request(app.getHttpServer())
        .post('/auth/login')
        .send({ username: '', password: 'InvalidPassword' })
        .expect(401) // jwt error

      return request(app.getHttpServer())
        .post('/auth/login')
        .send({ username: TEST_USER_NAME, password: '' })
        .expect(401) // jwt error
    })

    it('/auth/login (POST) with invalid password', () => {
      return request(app.getHttpServer())
        .post('/auth/login')
        .send({ username: TEST_USER_NAME, password: 'InvalidPassword' })
        .expect(401) // Expect an unauthorized error
    })

    it('/auth/login (POST) account lock after multiple failed attempts', async () => {
      const moduleFixture: TestingModule = await Test.createTestingModule({
        imports: [AppModule],
      }).compile()

      const app = moduleFixture.createNestApplication()
      await app.init()

      const registerResponse = await request(app.getHttpServer())
        .post('/auth/register')
        .send({ username: TEST_USER_NAME2, password: TEST_USER_PASSWORD })

      const accessToken = registerResponse.body.access_token
      const maxLoginAttempts = 3 // lock user when the third try is failed

      for (let i = 0; i < maxLoginAttempts; i++) {
        await request(app.getHttpServer())
          .post('/auth/login')
          .send({ username: TEST_USER_NAME2, password: 'InvalidPassword' })
      }

      // The account is locked after the third failed login attempt
      await request(app.getHttpServer())
        .post('/auth/login')
        .send({ username: TEST_USER_NAME2, password: TEST_USER_PASSWORD })
        .then((res) => {
          expect(res.body.message).toContain('The account is locked. Please try again in 5 minutes.')
        })

      await request(app.getHttpServer()).delete('/auth/delete-user').set('Authorization', `Bearer ${accessToken}`)

      await app.close()
    })
  })

  describe('refresh', () => {
    it('/auth/refresh (POST)', () => {
      return request(app.getHttpServer())
        .post('/auth/refresh')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ refreshToken })
        .expect(201)
    })

    it('/auth/refresh (POST) with empty refreshToken', () => {
      return request(app.getHttpServer())
        .post('/auth/refresh')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ refreshToken: '' })
        .expect(400)
    })

    it('/auth/refresh (POST) with user not found', () => {
      return request(app.getHttpServer())
        .post('/auth/refresh')
        .set('Authorization', `Bearer ${accessToken}111`)
        .send({ refreshToken })
        .expect(401) // Expect an unauthorized error
    })

    it('/auth/refresh (POST) without authorization', () => {
      return request(app.getHttpServer()).post('/auth/refresh').set('Authorization', `Bearer invalidToken`).expect(401) // Expect an unauthorized error
    })
  })

  describe('revise-password', () => {
    it('/auth/revise-password (PUT) with password does not match passwordRegex', () => {
      return request(app.getHttpServer())
        .put('/auth/revise-password')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          oldPassword: TEST_USER_PASSWORD,
          newPassword: '122121',
        })
        .expect(400)
    })

    // Test invalid revise-password
    it('/auth/revise-password (PUT) with the same as password', () => {
      return request(app.getHttpServer())
        .put('/auth/revise-password')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          oldPassword: TEST_USER_PASSWORD,
          newPassword: TEST_USER_PASSWORD,
        })
        .expect(401)
    })

    it('/auth/revise-password (PUT) with user not found', () => {
      return request(app.getHttpServer())
        .put('/auth/revise-password')
        .set('Authorization', `Bearer ${accessToken}111`)
        .send({
          oldPassword: TEST_USER_PASSWORD,
          newPassword: TEST_NEW_USER_PASSWORD,
        })
        .expect(401) // Expect an unauthorized error
    })

    it('/auth/revise-password (PUT) with wrong password', () => {
      return request(app.getHttpServer())
        .put('/auth/revise-password')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          oldPassword: TEST_NEW_USER_PASSWORD,
          newPassword: TEST_USER_PASSWORD,
        })
        .expect(401)
    })

    it('/auth/revise-password (PUT) revise password successfully', () => {
      return request(app.getHttpServer())
        .put('/auth/revise-password')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          oldPassword: TEST_USER_PASSWORD,
          newPassword: TEST_NEW_USER_PASSWORD,
        })
        .expect(200)
    })
  })

  describe('profile', () => {
    it('/auth/profile (GET)', () => {
      return request(app.getHttpServer()).get('/auth/profile').set('Authorization', `Bearer ${accessToken}`).expect(200)
    })

    // Test profile without authorization
    it('/auth/profile (GET) without authorization', () => {
      return request(app.getHttpServer()).get('/auth/profile').expect(401) // Expect an unauthorized error
    })

    it('/auth/profile (GET) without user not found', () => {
      return request(app.getHttpServer())
        .get('/auth/profile')
        .set('Authorization', `Bearer ${accessToken}111`)
        .expect(401) // Expect an unauthorized error
    })
  })

  describe('register', () => {
    // Test invalid register
    it('/auth/register (POST) without username or password', async () => {
      await request(app.getHttpServer())
        .post('/auth/register')
        .send({ username: '', password: 'InvalidPassword' })
        .expect(400)

      return request(app.getHttpServer())
        .post('/auth/register')
        .send({ username: TEST_USER_NAME, password: '' })
        .expect(400)
    })

    it('/auth/register (POST) with password that does not match passwordRegex', async () => {
      await request(app.getHttpServer())
        .post('/auth/register')
        .send({ username: TEST_USER_NAME, password: '121221' })
        .expect(400)
    })

    it('/auth/register (POST) with an existing username', async () => {
      await request(app.getHttpServer())
        .post('/auth/register')
        .send({ username: TEST_USER_NAME, password: TEST_USER_PASSWORD })
        .expect(400)
    })
  })

  describe('delete-user', () => {
    // Test delete user without authorization
    it('/auth/delete-user (DELETE) without authorization', () => {
      return request(app.getHttpServer()).delete('/auth/delete-user').expect(401) // Expect an unauthorized error
    })
  })
})
