import { Request, Response, NextFunction, RequestHandler } from 'express';
import { ForbiddenError } from '../shared/errors';

// Middleware factory: require at least one of the listed permissions
export function authorize(...requiredPermissions: string[]): RequestHandler {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.adminUser) {
      next(new ForbiddenError('Not authenticated'));
      return;
    }

    const userPermissions = new Set(req.adminUser.permissions);

    // Super admin bypass — check if user has wildcard permission
    if (userPermissions.has('*:*') || userPermissions.has('admin:super')) {
      next();
      return;
    }

    const hasPermission = requiredPermissions.some((perm) => userPermissions.has(perm));

    if (!hasPermission) {
      next(
        new ForbiddenError(
          `Required permission(s): ${requiredPermissions.join(', ')}`,
          'INSUFFICIENT_PERMISSIONS'
        )
      );
      return;
    }

    next();
  };
}

// Middleware: require any of the given roles
export function requireRole(...roleNames: string[]): RequestHandler {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    if (!req.adminUser) {
      next(new ForbiddenError('Not authenticated'));
      return;
    }

    // Load user roles from adminUser object
    const userRoleNames = (req.adminUser as any).userRoles?.map(
      (ur: { role: { name: string } }) => ur.role.name
    ) ?? [];

    const hasRole = roleNames.some((r) => userRoleNames.includes(r));

    if (!hasRole) {
      next(new ForbiddenError(`Required role(s): ${roleNames.join(', ')}`));
      return;
    }

    next();
  };
}
