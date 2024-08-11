import { Injectable } from '@nestjs/common'
import { Logger, createLogger, format, transports } from 'winston'
import { RequestContextMiddleware } from '@/middlewares/request-context'
import * as APM from 'elastic-apm-node'
import { ElasticsearchTransport } from 'winston-elasticsearch'

@Injectable()
export class LoggerService {
  private logger: Logger

  constructor() {
    const logFile = process.env.NODE_ENV === 'log-test' ? 'logs/test.log' : 'logs/combined.log'
    const errorLogFile = process.env.NODE_ENV === 'log-test' ? 'logs/test-error.log' : 'logs/error.log'

    const esTransportOpts = {
      level: 'info',
      clientOpts: {
        node: process.env.ELASTIC_SEARCH_URL,
        nodes: [process.env.ELASTIC_SEARCH_URL],
        auth: {
          username: process.env.ELASTIC_SEARCH_NAME,
          password: process.env.ELASTIC_SEARCH_PASSWORD,
        },
      },
    }

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
        new ElasticsearchTransport(esTransportOpts),
      ],
    })

    if (process.env.NODE_ENV !== 'test' && process.env.NODE_ENV !== 'log-test') {
      this.logger.add(
        new transports.Console({
          format: format.simple(),
        }),
      )
    }
  }

  info(message: string, meta?: any) {
    this.logger.info(message, meta)
    APM.captureError(new Error(message))
  }

  error(message: string, meta?: any) {
    this.logger.error(message, meta)
    APM.captureError(new Error(message))
  }

  warn(message: string, meta?: any) {
    this.logger.warn(message, meta)
    APM.captureError(new Error(message))
  }
}
