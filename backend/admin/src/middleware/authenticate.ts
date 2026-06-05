import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../config/env';
import { prisma } from '../config/database';
import { getRedisClient } from '../config/redis';
import { UnauthorizedError } from '../shared/errors';
import { AdminUser, UserStatus } from '@prisma/client';

export interface JwtPayload {
  sub: string;      // admin user id
  email: string;
  sessionId: string;
  iat: number;
  exp: number;
  iss: string;
}

// Extend Express Request
declare global {
  namespace Express {
    interface Request {
      adminUser: AdminUser & { permissions: string[] };
      sessionId: string;
    }
  }
}

const TOKEN_BLACKLIST_PREFIX = 'admin:blacklist:';

export async function authenticate(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
      throw new UnauthorizedError('Bearer token required');
    }

    const token = authHeader.substring(7);

    // Verify JWT
    let payload: JwtPayload;
    try {
      payload = jwt.verify(token, env.JWT_ACCESS_SECRET, {
        issuer: env.JWT_ISSUER,
      }) as JwtPayload;
    } catch (jwtError) {
      if (jwtError instanceof jwt.TokenExpiredError) {
        throw new UnauthorizedError('Token expired', 'TOKEN_EXPIRED');
      }
      throw new UnauthorizedError('Invalid token', 'INVALID_TOKEN');
    }

    // Check token blacklist (for revoked tokens)
    const redis = getRedisClient();
    const isBlacklisted = await redis.get(`${TOKEN_BLACKLIST_PREFIX}${payload.sub}:${payload.sessionId}`);
    if (isBlacklisted) {
      throw new UnauthorizedError('Session revoked', 'SESSION_REVOKED');
    }

    // Load user with roles and permissions
    const user = await prisma.adminUser.findUnique({
      where: { id: payload.sub },
      include: {
        userRoles: {
          include: {
            role: {
              include: {
                permissions: {
                  include: { permission: true },
                },
              },
            },
          },
        },
      },
    });

    if (!user) {
      throw new UnauthorizedError('User not found', 'USER_NOT_FOUND');
    }

    if (user.status !== UserStatus.ACTIVE) {
      throw new UnauthorizedError(`Account is ${user.status.toLowerCase()}`, 'ACCOUNT_INACTIVE');
    }

    // Flatten permissions
    const permissions = new Set<string>();
    for (const userRole of user.userRoles) {
      for (const rp of userRole.role.permissions) {
        permissions.add(`${rp.permission.resource}:${rp.permission.action}`);
      }
    }

    req.adminUser = { ...user, permissions: Array.from(permissions) };
    req.sessionId = payload.sessionId;

    next();
  } catch (error) {
    next(error);
  }
}

export async function blacklistToken(userId: string, sessionId: string, ttlSeconds: number): Promise<void> {
  const redis = getRedisClient();
  await redis.setex(`${TOKEN_BLACKLIST_PREFIX}${userId}:${sessionId}`, ttlSeconds, '1');
}
