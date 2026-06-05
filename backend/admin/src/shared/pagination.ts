import { Request } from 'express';
import { BadRequestError } from './errors';

export interface PaginationParams {
  page: number;
  limit: number;
  skip: number;
}

export interface SortParams {
  field: string;
  direction: 'asc' | 'desc';
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

const MAX_LIMIT = 100;
const DEFAULT_LIMIT = 20;

export function parsePagination(req: Request): PaginationParams {
  const rawPage = parseInt(req.query.page as string, 10);
  const rawLimit = parseInt(req.query.limit as string, 10);

  const page = isNaN(rawPage) || rawPage < 1 ? 1 : rawPage;
  const limit = isNaN(rawLimit) || rawLimit < 1 ? DEFAULT_LIMIT : Math.min(rawLimit, MAX_LIMIT);
  const skip = (page - 1) * limit;

  return { page, limit, skip };
}

export function parseSort(req: Request, allowedFields: string[], defaultField = 'createdAt'): SortParams {
  const rawSort = (req.query.sort as string) ?? defaultField;
  const direction = req.query.order === 'asc' ? 'asc' : 'desc';
  const field = allowedFields.includes(rawSort) ? rawSort : defaultField;

  return { field, direction };
}

export function buildPaginationMeta(total: number, params: PaginationParams): PaginationMeta {
  const totalPages = Math.ceil(total / params.limit);
  return {
    page: params.page,
    limit: params.limit,
    total,
    totalPages,
    hasNext: params.page < totalPages,
    hasPrev: params.page > 1,
  };
}

export function parseDateRange(req: Request): { from?: Date; to?: Date } {
  const from = req.query.from ? new Date(req.query.from as string) : undefined;
  const to = req.query.to ? new Date(req.query.to as string) : undefined;

  if (from && isNaN(from.getTime())) throw new BadRequestError('Invalid "from" date');
  if (to && isNaN(to.getTime())) throw new BadRequestError('Invalid "to" date');
  if (from && to && from > to) throw new BadRequestError('"from" date must be before "to" date');

  return { from, to };
}

export function parseSearch(req: Request): string | undefined {
  const q = req.query.q as string | undefined;
  return q ? q.trim().substring(0, 200) : undefined;
}
