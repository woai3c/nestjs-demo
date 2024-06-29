import { Injectable, NestMiddleware } from '@nestjs/common'
import { Request, Response, NextFunction } from 'express'
import { v4 as uuidv4 } from 'uuid'
import { createNamespace } from 'cls-hooked'

const requestNamespace = createNamespace('request')

@Injectable()
export class RequestContextMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    requestNamespace.run(() => {
      requestNamespace.set('requestId', uuidv4())
      next()
    })
  }

  static getRequestId(): string {
    return requestNamespace.get('requestId')
  }
}
