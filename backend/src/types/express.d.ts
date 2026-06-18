import { CurrentUser } from './request';

declare module 'express-serve-static-core' {
  interface Request {
    user?: CurrentUser;
  }
}

