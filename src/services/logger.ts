import { Injectable } from '@nestjs/common'
import { Logger, createLogger, format, transports } from 'winston'
import { RequestContextMiddleware } from '@/middlewares/request-context'

@Injectable()
export class LoggerService {
  private logger: Logger

  constructor() {
    const logFile = process.env.NODE_ENV === 'log-test' ? 'test.log' : 'combined.log'
    const errorLogFile = process.env.NODE_ENV === 'log-test' ? 'test-error.log' : 'error.log'

    this.logger = createLogger({
      level: 'info',
      format: format.combine(
        format.timestamp(),
        format.printf(({ timestamp, level, message, ...meta }) => {
          const requestId = RequestContextMiddleware.getRequestId()
          return `${timestamp} [${level.toUpperCase()}] [RequestID: ${requestId}] ${message} ${JSON.stringify(meta)}`
        }),
      ),
      transports: [
        new transports.File({ filename: errorLogFile, level: 'error' }),
        new transports.File({
          filename: logFile,
          level: 'info',
          format: format.combine(format((info) => (info.level === 'error' ? false : info))(), format.json()),
        }),
      ],
    })

    if (process.env.NODE_ENV !== 'production') {
      this.logger.add(
        new transports.Console({
          format: format.simple(),
        }),
      )
    }
  }

  info(message: string, meta?: any) {
    this.logger.info(message, meta)
  }

  error(message: string, meta?: any) {
    this.logger.error(message, meta)
  }

  warn(message: string, meta?: any) {
    this.logger.warn(message, meta)
  }
}
