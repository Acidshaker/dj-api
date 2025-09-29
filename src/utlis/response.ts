import type { Response } from "express";

interface SuccessOptions<T> {
  res: Response;
  status?: number;
  message?: string;
  data?: T;
  count?: number;
  next?: string | null;
  prev?: string | null;
  meta?: Record<string, any>;
}

interface ErrorOptions {
  res: Response;
  status?: number;
  message?: string;
  error?: any;
  fields?: Record<string, any>;
}

export const successResponse = <T>({
  res,
  status = 200,
  message = "Operación exitosa",
  data,
  count,
  next,
  prev,
  meta,
}: SuccessOptions<T>) => {
  return res.status(status).json({
    error: false,
    status,
    message,
    count,
    next,
    prev,
    meta,
    data,
  });
};

export const errorResponse = ({
  res,
  status = 500,
  message = "Error interno del servidor",
  error,
  fields,
}: ErrorOptions) => {
  return res.status(status).json({
    error: true,
    status,
    message,
    fields,
    data: error,
  });
};
