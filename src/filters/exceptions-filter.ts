import { ExceptionFilter, Catch, ArgumentsHost, HttpException } from '@nestjs/common'
import { Request, Response } from 'express'
import { LoggerService } from '@/services/logger'
import { RequestContextMiddleware } from '@/middlewares/request-context'

@Catch()
export class ExceptionsFilter implements ExceptionFilter {
  constructor(private readonly loggerService: LoggerService) {}

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp()
    const response = ctx.getResponse<Response>()
    const request = ctx.getRequest<Request>()
    const status = exception instanceof HttpException ? exception.getStatus() : 500
    const requestId = RequestContextMiddleware.getRequestId()

    const errorResponse = {
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      method: request.method,
      message: exception instanceof HttpException ? exception.message : 'Internal server error',
    }

    const errorMeta = {
      exception,
      body: request.body,
      query: request.query,
      headers: request.headers,
      ip: request.ip,
    }

    this.loggerService.error(`[Unhandled Exception] (${requestId})`, { ...errorResponse, ...errorMeta })

    response.status(status).json(errorResponse)
  }
}
