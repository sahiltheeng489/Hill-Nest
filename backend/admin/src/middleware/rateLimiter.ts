import rateLimit from 'express-rate-limit';
import RedisStore from 'rate-limit-redis';
import { getRedisClient } from '../config/redis';
import { env } from '../config/env';
import { TooManyRequestsError } from '../shared/errors';
import { Request } from 'express';

function makeStore(prefix: string) {
  return new RedisStore({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    sendCommand: async (...args: string[]) => {
      const client = getRedisClient();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return client.call(args[0], ...args.slice(1)) as any;
    },
    prefix,
  });
}

// General API rate limiter
export const apiRateLimiter = rateLimit({
  windowMs: env.RATE_LIMIT_WINDOW_MS,
  max: env.RATE_LIMIT_MAX_REQUESTS,
  standardHeaders: true,
  legacyHeaders: false,
  store: makeStore('rl:api:'),
  keyGenerator: (req: Request) => {
    return req.adminUser?.id ?? req.ip ?? 'anonymous';
  },
  handler: (_req, _res, next) => {
    next(new TooManyRequestsError('API rate limit exceeded. Please slow down.'));
  },
});

// Strict auth rate limiter (login/register)
export const authRateLimiter = rateLimit({
  windowMs: env.AUTH_RATE_LIMIT_WINDOW_MS,
  max: env.AUTH_RATE_LIMIT_MAX,
  standardHeaders: true,
  legacyHeaders: false,
  store: makeStore('rl:auth:'),
  keyGenerator: (req: Request) => req.ip ?? 'anonymous',
  skipSuccessfulRequests: true,
  handler: (_req, _res, next) => {
    next(
      new TooManyRequestsError(
        `Too many authentication attempts. Try again in ${Math.ceil(env.AUTH_RATE_LIMIT_WINDOW_MS / 60000)} minutes.`
      )
    );
  },
});

// Export rate limiter (heavier limit for data exports)
export const exportRateLimiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 minutes
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  store: makeStore('rl:export:'),
  keyGenerator: (req: Request) => req.adminUser?.id ?? req.ip ?? 'anonymous',
  handler: (_req, _res, next) => {
    next(new TooManyRequestsError('Export rate limit exceeded. Max 10 exports per 10 minutes.'));
  },
});
