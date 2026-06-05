import { Request, Response, NextFunction } from 'express';
import { AppError, ValidationError, InternalError } from '../shared/errors';
import { sendError } from '../shared/response';
import { logger } from '../config/logger';
import { env } from '../config/env';
import { ZodError } from 'zod';
import { Prisma } from '@prisma/client';
import { JsonWebTokenError, TokenExpiredError } from 'jsonwebtoken';

export function errorHandler(
  err: Error,
  req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _next: NextFunction
): void {
  // Already responded
  if (res.headersSent) return;

  // ── Operational Errors (known) ──────────────────────────────

  if (err instanceof ValidationError) {
    sendError(res, 400, err.code, err.message, err.fieldErrors);
    return;
  }

  if (err instanceof AppError) {
    if (!err.isOperational) {
      logger.error('Non-operational AppError', { error: err, url: req.originalUrl });
    }
    sendError(res, err.statusCode, err.code, err.message);
    return;
  }

  // ── Zod Validation ──────────────────────────────────────────

  if (err instanceof ZodError) {
    const fieldErrors: Record<string, string[]> = {};
    for (const issue of err.issues) {
      const path = issue.path.join('.') || '_root';
      if (!fieldErrors[path]) fieldErrors[path] = [];
      fieldErrors[path].push(issue.message);
    }
    sendError(res, 400, 'VALIDATION_ERROR', 'Validation failed', fieldErrors);
    return;
  }

  // ── Prisma Errors ───────────────────────────────────────────

  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    if (err.code === 'P2002') {
      const field = (err.meta?.target as string[])?.join(', ') ?? 'field';
      sendError(res, 409, 'CONFLICT', `A record with this ${field} already exists`);
      return;
    }
    if (err.code === 'P2025') {
      sendError(res, 404, 'NOT_FOUND', 'Record not found');
      return;
    }
    if (err.code === 'P2003') {
      sendError(res, 400, 'FOREIGN_KEY_VIOLATION', 'Referenced record does not exist');
      return;
    }
    logger.error('Prisma error', { code: err.code, meta: err.meta, url: req.originalUrl });
    sendError(res, 500, 'DATABASE_ERROR', 'Database operation failed');
    return;
  }

  if (err instanceof Prisma.PrismaClientValidationError) {
    sendError(res, 400, 'DATABASE_VALIDATION_ERROR', 'Invalid database query parameters');
    return;
  }

  // ── JWT Errors ──────────────────────────────────────────────

  if (err instanceof TokenExpiredError) {
    sendError(res, 401, 'TOKEN_EXPIRED', 'Access token has expired');
    return;
  }

  if (err instanceof JsonWebTokenError) {
    sendError(res, 401, 'INVALID_TOKEN', 'Invalid access token');
    return;
  }

  // ── Unknown Errors ──────────────────────────────────────────

  logger.error('Unhandled error', {
    error: err.message,
    stack: err.stack,
    url: req.originalUrl,
    method: req.method,
    userId: req.adminUser?.id,
  });

  const message = env.NODE_ENV === 'development' ? err.message : 'Internal server error';
  sendError(res, 500, 'INTERNAL_ERROR', message);
}

export function notFoundHandler(req: Request, res: Response): void {
  sendError(res, 404, 'ROUTE_NOT_FOUND', `Route ${req.method} ${req.originalUrl} not found`);
}
