import { LoggerService } from '@/services/logger';
import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

const privatePaths = [
  '/auth/login',
  '/auth/register',
  '/auth/refresh',
  '/auth/revise-password',
];
@Injectable()
export class LoggerMiddleware implements NestMiddleware {
  constructor(private loggerService: LoggerService) {}

  use(req: Request, res: Response, next: NextFunction) {
    const { method, originalUrl, body, query, headers } = req;
    const userAgent = headers['user-agent'] || '';
    const requestId = headers['x-request-id'] || ''; // unique request id

    const bodyStr = privatePaths.includes(originalUrl)
      ? '[PRIVATE]'
      : JSON.stringify(body);

    this.loggerService.info(
      `[Request] (${requestId}) ${method} ${originalUrl} - Body: ${bodyStr} - Query: ${JSON.stringify(query)} - Agent: ${userAgent}`,
    );

    next();

    const startTime = Date.now();
    res.on('finish', () => {
      const duration = Date.now() - startTime;
      this.loggerService.info(
        `[Response] (${requestId}) ${method} ${originalUrl} - Status: ${res.statusCode} - Duration: ${duration}ms`,
      );
    });

    // Error event listener
    res.on('close', () => {
      if (!res.writableEnded) {
        this.loggerService.info(
          `[Request Aborted] (${requestId}) ${method} ${originalUrl}`,
        );
      }
    });
  }
}
