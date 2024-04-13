import { Request } from 'express';

declare global {
  namespace Express {
    export interface Request {
      user?: {
        userId: string;
        username: string;
      };
    }
  }
}
