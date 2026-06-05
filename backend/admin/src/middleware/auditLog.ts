import { Request, Response, NextFunction, RequestHandler } from 'express';
import { prisma } from '../config/database';
import { AuditAction } from '@prisma/client';
import { logger } from '../config/logger';

export interface AuditOptions {
  action: AuditAction;
  resource: string;
  getResourceId?: (req: Request, res: Response) => string | undefined;
  getDescription?: (req: Request) => string;
  captureBody?: boolean;
}

// Middleware factory: writes an audit log entry after successful response
export function auditLog(options: AuditOptions): RequestHandler {
  return (req: Request, res: Response, next: NextFunction): void => {
    const originalJson = res.json.bind(res);

    res.json = function (body: unknown) {
      // Only log on successful responses (2xx)
      if (res.statusCode >= 200 && res.statusCode < 300) {
        const userId = req.adminUser?.id;
        const resourceId = options.getResourceId?.(req, res);
        const description = options.getDescription?.(req) ??
          `${options.action} on ${options.resource}${resourceId ? ` [${resourceId}]` : ''}`;

        // Fire-and-forget audit write (don't block response)
        prisma.auditLog
          .create({
            data: {
              adminUserId: userId,
              action: options.action,
              resource: options.resource,
              resourceId: resourceId ?? req.params.id,
              description,
              metadata: options.captureBody
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                ? (sanitizeForAudit(req.body as Record<string, unknown>) as any)
                : undefined,
              ipAddress: getClientIp(req),
              userAgent: req.get('user-agent'),
            },
          })
          .catch((err: Error) => logger.error('Failed to write audit log:', { error: err.message }));
      }

      return originalJson(body);
    };

    next();
  };
}

// Direct audit log write (for use in services)
export async function writeAuditLog(params: {
  adminUserId?: string;
  action: AuditAction;
  resource: string;
  resourceId?: string;
  description: string;
  metadata?: Record<string, unknown>;
  ipAddress?: string;
  userAgent?: string;
}): Promise<void> {
  try {
    await prisma.auditLog.create({
      data: {
        adminUserId: params.adminUserId ?? null,
        action: params.action,
        resource: params.resource,
        resourceId: params.resourceId ?? null,
        description: params.description,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        metadata: params.metadata ? (params.metadata as any) : undefined,
        ipAddress: params.ipAddress ?? null,
        userAgent: params.userAgent ?? null,
      },
    });
  } catch (err) {
    logger.error('Failed to write audit log:', { error: err });
  }
}

function sanitizeForAudit(body: Record<string, unknown>): Record<string, unknown> {
  const sensitiveFields = ['password', 'passwordHash', 'token', 'secret', 'mfaCode', 'otp'];
  const sanitized = { ...body };
  for (const field of sensitiveFields) {
    if (field in sanitized) {
      sanitized[field] = '[REDACTED]';
    }
  }
  return sanitized;
}

export function getClientIp(req: Request): string {
  return (
    (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() ??
    req.socket.remoteAddress ??
    'unknown'
  );
}
