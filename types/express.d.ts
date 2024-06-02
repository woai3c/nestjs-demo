/* eslint-disable @typescript-eslint/no-unused-vars */
import { Request } from 'express'

declare global {
  namespace Express {
    export interface Request {
      user?: {
        userId: string
        username: string
      }
    }
  }
}
