import { Test, TestingModule } from '@nestjs/testing'
import { LoggerMiddleware } from '@/middlewares/logger'
import { LoggerService } from '@/services/logger'
import { Request, Response, NextFunction } from 'express'

jest.mock('@/services/logger')
jest.mock('@/middlewares/request-context', () => ({
  RequestContextMiddleware: {
    getRequestId: jest.fn().mockReturnValue('12345'),
  },
}))

describe('LoggerMiddleware', () => {
  let middleware: LoggerMiddleware
  let loggerService: LoggerService
  let req: Partial<Request>
  let res: Partial<Response>
  let next: NextFunction

  beforeEach(async () => {
    process.env.NODE_ENV = 'log-test'

    const module: TestingModule = await Test.createTestingModule({
      providers: [LoggerMiddleware, LoggerService],
    }).compile()

    middleware = module.get<LoggerMiddleware>(LoggerMiddleware)
    loggerService = module.get<LoggerService>(LoggerService)

    req = {
      method: 'GET',
      originalUrl: '/test-url',
      body: { key: 'value' },
      query: { q: 'test' },
      headers: { 'user-agent': 'jest' },
      ip: '127.0.0.1',
    }
    res = {
      on: jest.fn(),
      statusCode: 200,
      writableEnded: true,
    }
    next = jest.fn()
  })

  afterEach(() => {
    jest.clearAllMocks()
    process.env.NODE_ENV = 'test'
  })

  it('should log request details', () => {
    middleware.use(req as Request, res as Response, next)
    expect(loggerService.info).toHaveBeenCalledWith(
      expect.stringContaining(
        '[Request] (12345) GET /test-url - Body: {"key":"value"} - Query: {"q":"test"} - Agent: jest - IP: 127.0.0.1',
      ),
    )
    expect(next).toHaveBeenCalled()
  })

  it('should log response details', () => {
    const onFinish = jest.fn()
    ;(res as Response).on = jest.fn((event, callback) => {
      if (event === 'finish') {
        onFinish.mockImplementation(callback)
      }
    }) as any

    middleware.use(req as Request, res as Response, next)
    onFinish()

    expect(loggerService.info).toHaveBeenCalledWith(
      expect.stringContaining('[Response] (12345) GET /test-url - Status: 200'),
    )
  })

  it('should log aborted request', () => {
    Object.defineProperty(res, 'writableEnded', {
      value: false,
      writable: true,
    })

    const onClose = jest.fn()
    ;(res as Response).on = jest.fn((event, callback) => {
      if (event === 'close') {
        onClose.mockImplementation(callback)
      }
    }) as any

    middleware.use(req as Request, res as Response, next)
    onClose()

    expect(loggerService.warn).toHaveBeenCalledWith(expect.stringContaining('[Request Aborted] (12345) GET /test-url'))
  })

  it('should mask sensitive request body', () => {
    req.originalUrl = '/auth/login'
    middleware.use(req as Request, res as Response, next)
    expect(loggerService.info).toHaveBeenCalledWith(expect.stringContaining('Body: [PRIVATE]'))
  })
})
