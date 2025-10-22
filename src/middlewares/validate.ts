import type { Request, Response, NextFunction } from 'express';
import type { ZodType } from 'zod';
import { errorResponse } from '../utils/response';

export const validateBody =
  (schema: ZodType) => (req: Request, res: Response, next: NextFunction) => {
    try {
      req.body = schema.parse(req.body);
      next();
    } catch (err) {
      return errorResponse({
        res,
        status: 400,
        message: 'Error de validación',
        error: err,
      });
    }
  };
