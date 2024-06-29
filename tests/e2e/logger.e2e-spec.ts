/* eslint-disable no-promise-executor-return */
import { INestApplication } from '@nestjs/common'
import * as request from 'supertest'
import * as fs from 'fs'
import * as path from 'path'
import { AppModule } from '@/app.module'
import { Test, TestingModule } from '@nestjs/testing'
import { TEST_USER_NAME, TEST_USER_PASSWORD } from '@tests/constants'
import { RequestContextMiddleware } from '@/middlewares/request-context'
import { LoggerService } from '@/services/logger'
import { ExceptionsFilter } from '@/filters/exceptions-filter'

describe('Logger (e2e)', () => {
  let app: INestApplication
  const logFile = 'test.log'
  const errorLogFile = 'test-error.log'

  beforeEach(async () => {
    process.env.NODE_ENV = 'log-test'
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile()

    app = moduleFixture.createNestApplication()
    const loggerService = app.get(LoggerService)
    app.useGlobalFilters(new ExceptionsFilter(loggerService))
    app.use(new RequestContextMiddleware().use)

    process.on('unhandledRejection', (reason: Error) => {
      loggerService.error('Unhandled Rejection', {
        message: reason.message,
        stack: reason.stack,
      })
    })

    process.on('uncaughtException', (error: Error) => {
      loggerService.error('Uncaught Exception', {
        message: error.message,
        stack: error.stack,
      })
    })

    await app.init()
  })

  afterEach(async () => {
    fs.truncateSync(path.join(process.cwd(), logFile), 0)
    fs.truncateSync(path.join(process.cwd(), errorLogFile), 0)
    process.env.NODE_ENV = 'test'
    await app.close()
  })

  it('should log request details', async () => {
    await request(app.getHttpServer()).get('/').query({ q: 'test' }).set('User-Agent', 'jest').expect(200)

    const logContent = getContent(logFile)
    const requestId = extractRequestId(logContent)

    expect(logContent).toContain(`[Request] (${requestId})`)
    expect(logContent).toContain(`GET /`)
    expect(logContent).toContain(`Query: {"q":"test"}`)
    expect(logContent).toContain(`Agent: jest`)
    expect(logContent).toContain(`IP: ::ffff:127.0.0.1`)
  })

  it('should log response details', async () => {
    await request(app.getHttpServer()).get('/').expect(200)

    const logContent = getContent(logFile)
    const requestId = extractRequestId(logContent)
    expect(logContent).toContain(`[Response] (${requestId})`)
    expect(logContent).toContain(`GET /`)
    expect(logContent).toContain(`Status: 200`)
  })

  it('should mask sensitive request body', async () => {
    await request(app.getHttpServer())
      .post('/auth/login')
      .send({ username: TEST_USER_NAME, password: TEST_USER_PASSWORD })
      .expect(200)

    const logContent = getContent(logFile)
    expect(logContent).toContain(`Body: [PRIVATE]`)
  })

  it('should log unhandled rejection', async () => {
    // Simulate an unhandled rejection
    ;(process as NodeJS.EventEmitter).emit(
      'unhandledRejection',
      new Error('Unhandled Rejection Test'),
      Promise.resolve(),
    )

    await new Promise((resolve) => setTimeout(resolve, 200)) // Wait for the log to be written

    const errorLogContent = getContent(errorLogFile)
    expect(errorLogContent).toContain('Unhandled Rejection Test')
  })

  it('should log uncaught exception', async () => {
    // Simulate an uncaught exception
    process.emit('uncaughtException', new Error('Uncaught Exception Test'))

    await new Promise((resolve) => setTimeout(resolve, 200)) // Wait for the log to be written

    const errorLogContent = getContent(errorLogFile)
    expect(errorLogContent).toContain('Uncaught Exception Test')
  })

  it('should log handled exceptions', async () => {
    await request(app.getHttpServer()).get('/non-existent-endpoint').expect(404)

    const errorLogContent = getContent(errorLogFile)
    const requestId = extractRequestId(errorLogContent)
    expect(errorLogContent).toContain(`[Unhandled Exception] (${requestId})`)
    expect(errorLogContent).toContain('Cannot GET /non-existent-endpoint')
    expect(errorLogContent).toContain('Status: 404')
  })
})

function getContent(file: string) {
  return fs.readFileSync(path.join(process.cwd(), file), 'utf8').replace(/\\"/g, '"')
}

function extractRequestId(logContent: string): string {
  const match = logContent.match(/\(([a-f0-9-]+)\)/)
  return match ? match[1] : ''
}
