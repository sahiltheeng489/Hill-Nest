import { prisma } from '../../config/database';
import { getRedisClient } from '../../config/redis';
import { logger } from '../../config/logger';

export async function getHealthStatus() {
  const results: Record<string, { status: 'healthy' | 'degraded' | 'down'; latency?: number; message?: string }> = {};

  // Database check
  try {
    const start = Date.now();
    await prisma.$queryRaw`SELECT 1`;
    results.database = { status: 'healthy', latency: Date.now() - start };
  } catch (err) {
    logger.error('DB health check failed:', err);
    results.database = { status: 'down', message: 'Cannot connect to PostgreSQL' };
  }

  // Redis check
  try {
    const start = Date.now();
    const redis = getRedisClient();
    await redis.ping();
    results.redis = { status: 'healthy', latency: Date.now() - start };
  } catch (err) {
    logger.error('Redis health check failed:', err);
    results.redis = { status: 'down', message: 'Cannot connect to Redis' };
  }

  // API check (self)
  results.api = { status: 'healthy', latency: 0 };

  const overall = Object.values(results).every(r => r.status === 'healthy') ? 'healthy' : 'degraded';
  return { overall, services: results, timestamp: new Date().toISOString() };
}

export async function getSystemMetrics() {
  const [bookingCount, customerCount, paymentCount, auditLogCount, sessionCount] = await Promise.all([
    prisma.booking.count(),
    prisma.customer.count(),
    prisma.payment.count(),
    prisma.auditLog.count(),
    prisma.adminSession.count({ where: { isRevoked: false, expiresAt: { gt: new Date() } } }),
  ]);

  // Node.js process metrics
  const mem = process.memoryUsage();
  const uptime = process.uptime();

  return {
    database: { bookings: bookingCount, customers: customerCount, payments: paymentCount, auditLogs: auditLogCount },
    runtime: {
      activeSessions: sessionCount,
      memoryUsed: Math.round(mem.heapUsed / 1024 / 1024),
      memoryTotal: Math.round(mem.heapTotal / 1024 / 1024),
      uptime: Math.round(uptime),
      nodeVersion: process.version,
    },
    timestamp: new Date().toISOString(),
  };
}
