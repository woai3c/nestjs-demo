import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import logger from '@/utils/logger';

@Injectable()
export class LoggerMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    logger.info(`Incoming request: ${req.method} ${req.url}`);

    const startTime = Date.now();
    res.on('finish', () => {
      const duration = Date.now() - startTime;
      logger.info(
        `Request completed: ${req.method} ${req.url} ${res.statusCode} ${duration}ms`,
      );
    });

    next();
  }
}
