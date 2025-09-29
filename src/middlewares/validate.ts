import type { Request, Response, NextFunction } from "express";
import type { ZodType } from "zod";



export const validateBody =
  (schema: ZodType) => (req: Request, res: Response, next: NextFunction) => {
    try {
      req.body = schema.parse(req.body);
      next();
    } catch (err) {
      return res.status(400).json({ error: err });
    }
  };
