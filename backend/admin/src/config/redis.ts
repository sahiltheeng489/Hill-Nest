import Redis from 'ioredis';
import { env } from './env';

let redisClient: Redis | null = null;

export function getRedisClient(): Redis {
  if (!redisClient) {
    redisClient = new Redis(env.REDIS_URL, {
      password: env.REDIS_PASSWORD || undefined,
      maxRetriesPerRequest: 3,
      retryStrategy(times) {
        const delay = Math.min(times * 50, 2000);
        return delay;
      },
      lazyConnect: true,
      enableReadyCheck: true,
    });

    redisClient.on('connect', () => console.info('✅ Redis connected'));
    redisClient.on('error', (err) => console.error('❌ Redis error:', err));
    redisClient.on('reconnecting', () => console.warn('⚠️  Redis reconnecting...'));
  }
  return redisClient;
}

export async function connectRedis(): Promise<void> {
  const client = getRedisClient();
  if (client.status === 'ready' || client.status === 'connect' || client.status === 'connecting') {
    return;
  }

  await client.connect();
}

export async function disconnectRedis(): Promise<void> {
  if (redisClient) {
    await redisClient.quit();
    redisClient = null;
  }
}

// Helper: Set with TTL
export async function redisSet(key: string, value: string, ttlSeconds?: number): Promise<void> {
  const client = getRedisClient();
  if (ttlSeconds) {
    await client.setex(key, ttlSeconds, value);
  } else {
    await client.set(key, value);
  }
}

// Helper: Get
export async function redisGet(key: string): Promise<string | null> {
  return getRedisClient().get(key);
}

// Helper: Delete
export async function redisDel(key: string): Promise<void> {
  await getRedisClient().del(key);
}

// Helper: Increment with expiry (for rate limiting, lockout counters)
export async function redisIncr(key: string, ttlSeconds: number): Promise<number> {
  const client = getRedisClient();
  const pipeline = client.pipeline();
  pipeline.incr(key);
  pipeline.expire(key, ttlSeconds);
  const results = await pipeline.exec();
  return (results?.[0]?.[1] as number) ?? 0;
}
