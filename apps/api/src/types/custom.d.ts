import { Request } from 'express';

declare global {
  namespace Express {
    interface Request {
      token?: string;
      user?: any; // You can replace `any` with a more specific user type if needed
    }
  }
}
