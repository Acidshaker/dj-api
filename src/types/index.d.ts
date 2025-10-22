import type { JwtPayload } from 'jsonwebtoken';
import type { User } from '../models/User';

declare global {
  namespace Express {
    interface Request {
      user: User;
    }
  }
}
