import { Response } from 'express';

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  message?: string;
  error?: {
    code: string;
    message: string;
    fieldErrors?: Record<string, string[]>;
  };
  meta?: Record<string, unknown>;
  timestamp: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

export function sendSuccess<T>(
  res: Response,
  data: T,
  statusCode = 200,
  message?: string,
  meta?: Record<string, unknown>
): void {
  const response: ApiResponse<T> = {
    success: true,
    data,
    message,
    meta,
    timestamp: new Date().toISOString(),
  };
  res.status(statusCode).json(response);
}

export function sendPaginated<T>(
  res: Response,
  items: T[],
  pagination: PaginatedResponse<T>['pagination'],
  statusCode = 200
): void {
  const response: ApiResponse<PaginatedResponse<T>> = {
    success: true,
    data: { items, pagination },
    timestamp: new Date().toISOString(),
  };
  res.status(statusCode).json(response);
}

export function sendError(
  res: Response,
  statusCode: number,
  code: string,
  message: string,
  fieldErrors?: Record<string, string[]>
): void {
  const response: ApiResponse = {
    success: false,
    error: { code, message, fieldErrors },
    timestamp: new Date().toISOString(),
  };
  res.status(statusCode).json(response);
}

export function sendCreated<T>(res: Response, data: T, message?: string): void {
  sendSuccess(res, data, 201, message);
}

export function sendNoContent(res: Response): void {
  res.status(204).end();
}
