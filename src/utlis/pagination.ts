import type { Request } from "express";

export interface PaginationParams {
  page: number;
  limit: number;
  offset: number;
}

export const getPaginationParams = (req: Request): PaginationParams => {
  const page = parseInt(req.query.page as string, 10) || 1;
  const limit = parseInt(req.query.limit as string, 10) || 10;
  const offset = (page - 1) * limit;

  return { page, limit, offset };
};

export interface PaginatedResponse<T> {
  count: number;
  totalPages: number;
  page: number;
  results: T[];
}

export const formatPaginatedResponse = <T>(
  data: { count: number; rows: T[] },
  page: number,
  limit: number
): PaginatedResponse<T> => {
  return {
    count: data.count,
    totalPages: Math.ceil(data.count / limit),
    page,
    results: data.rows || [],
  };
};
