import { Test, TestingModule } from '@nestjs/testing'
import { LoggerService } from '@/services/logger'
import { HttpException } from '@nestjs/common'
import { Request, Response } from 'express'
import { ExceptionsFilter } from '@/filters/exceptions-filter'

describe('ExceptionsFilter', () => {
  let exceptionsFilter: ExceptionsFilter
  let loggerService: LoggerService

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ExceptionsFilter,
        {
          provide: LoggerService,
          useValue: {
            error: jest.fn(),
          },
        },
      ],
    }).compile()

    exceptionsFilter = module.get<ExceptionsFilter>(ExceptionsFilter)
    loggerService = module.get<LoggerService>(LoggerService)
  })

  it('should log and respond with the correct error message', () => {
    const mockRequest = {
      url: '/test',
      method: 'GET',
      body: {},
      query: {},
      headers: {},
      ip: '127.0.0.1',
    } as Request

    const mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    } as unknown as Response

    const exception = new HttpException('Test error', 400)

    exceptionsFilter.catch(exception, {
      switchToHttp: () => ({
        getRequest: () => mockRequest,
        getResponse: () => mockResponse,
      }),
    } as any)

    expect(mockResponse.status).toHaveBeenCalledWith(400)
    expect(mockResponse.json).toHaveBeenCalledWith(
      expect.objectContaining({
        statusCode: 400,
        message: 'Test error',
      }),
    )
    expect(loggerService.error).toHaveBeenCalled()
  })
})
