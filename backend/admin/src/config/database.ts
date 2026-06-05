import { PrismaClient } from '@prisma/client';
import { env } from './env';

declare global {
  // eslint-disable-next-line no-var
  var __prisma: PrismaClient | undefined;
}

const createPrismaClient = () => {
  return new PrismaClient({
    log:
      env.NODE_ENV === 'development'
        ? [{ emit: 'event', level: 'query' }, 'info', 'warn', 'error']
        : ['warn', 'error'],
    errorFormat: env.NODE_ENV === 'development' ? 'pretty' : 'minimal',
  });
};

// Singleton pattern — prevents multiple Prisma clients in development HMR
export const prisma = globalThis.__prisma ?? createPrismaClient();

if (env.NODE_ENV !== 'production') {
  globalThis.__prisma = prisma;
}

export async function connectDatabase(): Promise<void> {
  try {
    await prisma.$connect();
    console.info('✅ PostgreSQL connected via Prisma');
  } catch (error) {
    console.error('❌ Database connection failed:', error);
    throw error;
  }
}

export async function disconnectDatabase(): Promise<void> {
  await prisma.$disconnect();
}

// Graceful shutdown
process.on('beforeExit', async () => {
  await disconnectDatabase();
});
