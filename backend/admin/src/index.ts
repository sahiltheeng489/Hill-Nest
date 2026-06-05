import 'express-async-errors';
import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { env } from './config/env';
import { connectDatabase } from './config/database';
import { getRedisClient } from './config/redis';
import { logger, httpLogger } from './config/logger';
import { securityHeaders, enforceHttps } from './middleware/securityHeaders';
import { apiRateLimiter } from './middleware/rateLimiter';
import { errorHandler, notFoundHandler } from './middleware/errorHandler';
import adminRouter from './router';
import client from 'prom-client';

const app = express();

// ── Security ─────────────────────────────────────────────────
app.set('trust proxy', 1);
app.use(enforceHttps());
app.use(...securityHeaders());

// ── CORS ──────────────────────────────────────────────────────
app.use(
  cors({
    origin: env.ADMIN_FRONTEND_URL,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-CSRF-Token'],
    exposedHeaders: ['X-Request-ID', 'X-RateLimit-Limit', 'X-RateLimit-Remaining'],
  })
);

// ── Body parsing ──────────────────────────────────────────────
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

// ── Logging ───────────────────────────────────────────────────
app.use(httpLogger());

// ── Rate limiting ─────────────────────────────────────────────
app.use('/api/admin', apiRateLimiter);

// ── Prometheus metrics ────────────────────────────────────────
client.collectDefaultMetrics({ prefix: 'hillnest_admin_' });
app.get(env.PROMETHEUS_METRICS_PATH ?? '/metrics', async (_req, res) => {
  res.set('Content-Type', client.register.contentType);
  res.end(await client.register.metrics());
});

// ── Health check (no auth) ────────────────────────────────────
app.get('/health', (_req, res) =>
  res.json({ status: 'ok', timestamp: new Date().toISOString(), env: env.NODE_ENV })
);

// ── Admin API ─────────────────────────────────────────────────
app.use('/api/admin', adminRouter);

// ── Error handlers ────────────────────────────────────────────
app.use(notFoundHandler);
app.use(errorHandler);

// ── Bootstrap ─────────────────────────────────────────────────
async function bootstrap() {
  try {
    await connectDatabase();

    const server = app.listen(env.PORT, env.HOST, () => {
      logger.info(`🚀 HillNest Admin Service running at http://${env.HOST}:${env.PORT}`);
      logger.info(`📄 Docs: http://${env.HOST}:${env.PORT}/api/admin`);
    });

    // Graceful shutdown
    const shutdown = async (signal: string) => {
      logger.info(`Received ${signal} — shutting down gracefully…`);
      server.close(async () => {
        try {
          await getRedisClient().quit();
          logger.info('Admin service shut down complete');
          process.exit(0);
        } catch (err) {
          logger.error('Error during shutdown:', err);
          process.exit(1);
        }
      });
    };

    process.on('SIGTERM', () => shutdown('SIGTERM'));
    process.on('SIGINT', () => shutdown('SIGINT'));

    // Unhandled rejections
    process.on('unhandledRejection', (reason, promise) => {
      logger.error('Unhandled Rejection at:', promise, 'reason:', reason);
    });

    process.on('uncaughtException', (err) => {
      logger.error('Uncaught Exception:', err);
      process.exit(1);
    });
  } catch (error) {
    logger.error('Fatal error during bootstrap:', error);
    process.exit(1);
  }
}

void bootstrap();
