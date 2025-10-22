import type { Response } from 'express';

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

const parseZodError = (error: any) => {
  if (error?.name === 'ZodError' && Array.isArray(error?.issues)) {
    return error.issues.map((issue: any) => ({
      field: issue.path.join('.'),
      message: issue.message,
    }));
  }
  return null;
};

const parseSequelizeError = (error: any) => {
  if (error?.name?.includes('Sequelize') && Array.isArray(error?.errors)) {
    return error.errors.map((e: any) => ({
      field: e.path,
      message: e.message,
    }));
  }
  return null;
};

export const successResponse = <T>({
  res,
  status = 200,
  message = 'Operación exitosa',
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
  message = 'Error interno del servidor',
  error,
  fields,
}: ErrorOptions) => {
  const zodFields = parseZodError(error);
  const sequelizeFields = parseSequelizeError(error);

  const parsedFields = fields || zodFields || sequelizeFields;

  return res.status(status).json({
    error: true,
    status,
    message,
    fields: parsedFields || undefined,
    data: parsedFields ? undefined : error, // solo mostramos el error crudo si no se pudo parsear
  });
};
