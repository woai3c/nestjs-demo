import { Test, TestingModule } from '@nestjs/testing'
import { INestApplication, ValidationPipe } from '@nestjs/common'
import * as request from 'supertest'
import { AppModule } from '@/app.module'
import { Role } from '@/modules/users/users.dto'
import {
  TEST_NEW_USER_PASSWORD,
  TEST_SUPER_ADMIN,
  TEST_USER_NAME3,
  TEST_USER_NAME4,
  TEST_USER_NAME5,
  TEST_USER_PASSWORD,
} from '@tests/constants'

describe('UsersController (e2e)', () => {
  let app: INestApplication
  let superAdminAccessToken: string
  let adminAccessToken: string
  let userAccessToken: string
  let userId: string
  let userId2: string
  let adminId: string

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile()

    app = moduleFixture.createNestApplication()
    app.useGlobalPipes(new ValidationPipe())
    await app.init()

    const superAdminLoginResponse = await request(app.getHttpServer())
      .post('/auth/register')
      .send({ username: TEST_SUPER_ADMIN, password: TEST_USER_PASSWORD })
      .expect(201)

    superAdminAccessToken = superAdminLoginResponse.body.access_token

    const adminLoginResponse = await request(app.getHttpServer())
      .post('/auth/register')
      .send({ username: TEST_USER_NAME4, password: TEST_USER_PASSWORD })
      .expect(201)

    adminAccessToken = adminLoginResponse.body.access_token

    const adminProlfile = await request(app.getHttpServer())
      .get('/auth/profile')
      .set('Authorization', `Bearer ${adminAccessToken}`)

    adminId = adminProlfile.body._id

    const userRegisterResponse = await request(app.getHttpServer())
      .post('/auth/register')
      .send({ username: TEST_USER_NAME3, password: TEST_USER_PASSWORD })
      .expect(201)

    userAccessToken = userRegisterResponse.body.access_token

    const userProlfile = await request(app.getHttpServer())
      .get('/auth/profile')
      .set('Authorization', `Bearer ${userAccessToken}`)

    userId = userProlfile.body._id
  })

  afterAll(async () => {
    await request(app.getHttpServer())
      .delete('/auth/delete-user')
      .set('Authorization', `Bearer ${superAdminAccessToken}`)

    await app.close()
  })

  describe('create', () => {
    it('/users (POST) as superadmin', () => {
      return request(app.getHttpServer())
        .post('/users')
        .set('Authorization', `Bearer ${superAdminAccessToken}`)
        .send({ username: TEST_USER_NAME5, password: TEST_NEW_USER_PASSWORD })
        .expect(201)
        .then((res) => {
          userId2 = res.body._id
          expect(res.body).toHaveProperty('_id')
          expect(res.body).toHaveProperty('username', TEST_USER_NAME5)
        })
    })

    it('/users (POST) as admin', () => {
      return request(app.getHttpServer())
        .post('/users')
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send({ username: TEST_USER_NAME5, password: TEST_NEW_USER_PASSWORD })
        .expect(403) // Forbidden
    })

    it('/users (POST) as regular user', () => {
      return request(app.getHttpServer())
        .post('/users')
        .set('Authorization', `Bearer ${userAccessToken}`)
        .send({ username: TEST_USER_NAME5, password: TEST_NEW_USER_PASSWORD })
        .expect(403) // Forbidden
    })
  })

  describe('assignRole', () => {
    it('/users/assign-role (PUT) as superadmin', () => {
      return request(app.getHttpServer())
        .put('/users/assign-role')
        .set('Authorization', `Bearer ${superAdminAccessToken}`)
        .send({ userId: adminId, role: Role.Admin })
        .expect(200)
        .then((res) => {
          expect(res.body).toHaveProperty('_id', adminId)
          expect(res.body).toHaveProperty('role', Role.Admin)
        })
    })

    it('/users/assign-role (PUT) as admin', () => {
      return request(app.getHttpServer())
        .put('/users/assign-role')
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send({ userId: adminId, role: Role.Admin })
        .expect(403) // Forbidden
    })

    it('/users/assign-role (PUT) as regular user', () => {
      return request(app.getHttpServer())
        .put('/users/assign-role')
        .set('Authorization', `Bearer ${userAccessToken}`)
        .send({ userId, role: Role.Admin })
        .expect(403) // Forbidden
    })
  })

  describe('findAll', () => {
    it('/users (GET) as superadmin', () => {
      return request(app.getHttpServer())
        .get('/users')
        .set('Authorization', `Bearer ${superAdminAccessToken}`)
        .expect(200)
        .then((res) => {
          expect(Array.isArray(res.body)).toBe(true)
        })
    })

    it('/users (GET) as admin', () => {
      return request(app.getHttpServer())
        .get('/users')
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .expect(200)
        .then((res) => {
          expect(Array.isArray(res.body)).toBe(true)
        })
    })

    it('/users (GET) as regular user', () => {
      return request(app.getHttpServer()).get('/users').set('Authorization', `Bearer ${userAccessToken}`).expect(403) // Forbidden
    })
  })

  describe('findOne', () => {
    it('/users/:id (GET) as superadmin', () => {
      return request(app.getHttpServer())
        .get(`/users/${userId}`)
        .set('Authorization', `Bearer ${superAdminAccessToken}`)
        .expect(200)
        .then((res) => {
          expect(res.body).toHaveProperty('_id', userId)
          expect(res.body).toHaveProperty('username', TEST_USER_NAME3)
        })
    })

    it('/users/:id (GET) as admin', () => {
      return request(app.getHttpServer())
        .get(`/users/${userId}`)
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .expect(200)
        .then((res) => {
          expect(res.body).toHaveProperty('_id', userId)
          expect(res.body).toHaveProperty('username', TEST_USER_NAME3)
        })
    })

    it('/users/:id (GET) as regular user', () => {
      return request(app.getHttpServer())
        .get(`/users/${userId}`)
        .set('Authorization', `Bearer ${userAccessToken}`)
        .expect(403) // Forbidden
    })
  })

  describe('update', () => {
    it('/users/:id (PUT) as superadmin', () => {
      return request(app.getHttpServer())
        .put(`/users/${userId}`)
        .set('Authorization', `Bearer ${superAdminAccessToken}`)
        .send({ password: TEST_NEW_USER_PASSWORD })
        .expect(200)
        .then((res) => {
          expect(res.body).toHaveProperty('_id', userId)
        })
    })

    it('/users/:id (PUT) as admin', () => {
      return request(app.getHttpServer())
        .put(`/users/${userId}`)
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send({ password: TEST_NEW_USER_PASSWORD })
        .expect(403) // Forbidden
    })

    it('/users/:id (PUT) as regular user', () => {
      return request(app.getHttpServer())
        .put(`/users/${userId}`)
        .set('Authorization', `Bearer ${userAccessToken}`)
        .send({ password: TEST_NEW_USER_PASSWORD })
        .expect(403) // Forbidden
    })
  })

  describe('delete', () => {
    it('/users/:id (DELETE) as admin', () => {
      return request(app.getHttpServer())
        .delete(`/users/${userId}`)
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .expect(403) // Forbidden
    })

    it('/users/:id (DELETE) as regular user', () => {
      return request(app.getHttpServer())
        .delete(`/users/${userId}`)
        .set('Authorization', `Bearer ${userAccessToken}`)
        .expect(403) // Forbidden
    })

    it('/users/:id (DELETE) as superadmin', async () => {
      await request(app.getHttpServer())
        .delete(`/users/${userId}`)
        .set('Authorization', `Bearer ${superAdminAccessToken}`)
        .expect(200)

      await request(app.getHttpServer())
        .delete(`/users/${userId2}`)
        .set('Authorization', `Bearer ${superAdminAccessToken}`)
        .expect(200)

      return request(app.getHttpServer())
        .delete(`/users/${adminId}`)
        .set('Authorization', `Bearer ${superAdminAccessToken}`)
        .expect(200)
    })
  })
})
