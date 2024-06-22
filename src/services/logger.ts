import { Injectable } from '@nestjs/common'
import * as winston from 'winston'
import { Logger, format, transports } from 'winston'
import * as APM from 'elastic-apm-node'
import { ElasticsearchTransport } from 'winston-elasticsearch'

@Injectable()
export class LoggerService {
  private logger: Logger

  constructor() {
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

    this.logger = winston.createLogger({
      level: 'info',
      format: format.json(),
      transports: [
        new transports.File({ filename: 'error.log', level: 'error' }),
        new transports.File({ filename: 'combined.log' }),
        new ElasticsearchTransport(esTransportOpts),
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

  info(message: string) {
    this.logger.info(message)
    APM.captureError(new Error(message))
  }

  error(message: string) {
    this.logger.error(message)
    APM.captureError(new Error(message))
  }

  warn(message: string) {
    this.logger.warn(message)
    APM.captureError(new Error(message))
  }
}
