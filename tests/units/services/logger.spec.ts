import { LoggerService } from '@/services/logger'
import { Test, TestingModule } from '@nestjs/testing'
import { Logger, createLogger, transports } from 'winston'

jest.mock('winston', () => {
  const mLogger = {
    info: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
    add: jest.fn(),
  }

  const mFormat: Record<string, any> = jest.fn(() => jest.fn())

  mFormat.combine = jest.fn((...args) => args)
  mFormat.timestamp = jest.fn(() => jest.fn())
  mFormat.printf = jest.fn(() => jest.fn())
  mFormat.simple = jest.fn(() => jest.fn())
  mFormat.json = jest.fn(() => jest.fn())

  const mTransports = {
    File: jest.fn(),
    Console: jest.fn(),
  }

  return {
    createLogger: jest.fn(() => mLogger),
    format: mFormat,
    transports: mTransports,
  }
})

describe('LoggerService', () => {
  let service: LoggerService
  let logger: Logger

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [LoggerService],
    }).compile()

    service = module.get<LoggerService>(LoggerService)
    logger = createLogger()

    jest.clearAllMocks()
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  it('should log info messages', () => {
    service.info('test message')
    expect(logger.info).toHaveBeenCalledWith('test message', undefined)
  })

  it('should log error messages', () => {
    service.error('test error', { error: 'error details' })
    expect(logger.error).toHaveBeenCalledWith('test error', { error: 'error details' })
  })

  it('should log warn messages', () => {
    service.warn('test warning')
    expect(logger.warn).toHaveBeenCalledWith('test warning', undefined)
  })

  it('should add console transport in non-production environments', () => {
    service = new LoggerService()
    expect(transports.Console).toHaveBeenCalledWith({ format: expect.anything() })
  })

  it('should not add console transport in production environment', () => {
    process.env.NODE_ENV = 'production'
    expect(logger.add).not.toHaveBeenCalled()
  })

  it('should add console transport in non-production environments', () => {
    process.env.NODE_ENV = 'test'
    service = new LoggerService()
    expect(logger.add).toHaveBeenCalledWith(expect.anything())
  })
})
