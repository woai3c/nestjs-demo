import { LoggerService } from '@/services/logger'
import { Injectable, NestMiddleware } from '@nestjs/common'
import { Request, Response, NextFunction } from 'express'

const privatePaths = ['/auth/login', '/auth/register', '/auth/refresh', '/auth/revise-password']

@Injectable()
export class LoggerMiddleware implements NestMiddleware {
  constructor(private loggerService: LoggerService) {}

  use(req: Request, res: Response, next: NextFunction) {
    if (process.env.NODE_ENV === 'test') {
      return next()
    }

    const { method, originalUrl, body, query, headers } = req
    const userAgent = headers['user-agent'] || ''
    const requestId = headers['x-request-id'] || '' // unique request id
    const ip = req.ip || req.connection.remoteAddress || ''
    const referer = headers.referer || ''

    const bodyStr = privatePaths.includes(originalUrl) ? '[PRIVATE]' : JSON.stringify(body)
    const startTime = Date.now()
    const timestamp = new Date().toISOString()

    this.loggerService.info(
      `[${timestamp}] [Request] (${requestId}) ${method} ${originalUrl} - Body: ${bodyStr} - Query: ${JSON.stringify(query)} - Agent: ${userAgent} - IP: ${ip} - Referer: ${referer}`,
    )

    res.on('finish', () => {
      const duration = Date.now() - startTime
      const responseTimestamp = new Date().toISOString()
      const logLevel = res.statusCode >= 400 ? 'error' : 'info'

      this.loggerService[logLevel](
        `[${responseTimestamp}] [Response] (${requestId}) ${method} ${originalUrl} - Status: ${res.statusCode} - Duration: ${duration}ms`,
      )
    })

    // Error event listener
    res.on('close', () => {
      if (!res.writableEnded) {
        const closeTimestamp = new Date().toISOString()
        this.loggerService.warn(`[${closeTimestamp}] [Request Aborted] (${requestId}) ${method} ${originalUrl}`)
      }
    })

    next()
  }
}
