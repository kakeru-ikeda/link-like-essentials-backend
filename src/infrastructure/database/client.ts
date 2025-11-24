import { PrismaClient } from '@prisma/client';

import { logger } from '../logger/Logger';

function getEnvVar(key: string): string {
  const value = process.env[key];
  if (!value) {
    throw new Error(`Environment variable ${key} is not set`);
  }
  return value;
}

const databaseUrl = getEnvVar('LLES_DATABASE_URL');

export const prisma = new PrismaClient({
  datasources: {
    db: {
      url: databaseUrl,
    },
  },
  log: [
    {
      emit: 'event',
      level: 'query',
    },
    {
      emit: 'event',
      level: 'error',
    },
    {
      emit: 'event',
      level: 'warn',
    },
  ],
});

// Query logging
prisma.$on('query', (e) => {
  logger.debug('Prisma Query', {
    query: e.query,
    params: e.params,
    duration: e.duration,
  });
});

// Error logging
prisma.$on('error', (e) => {
  logger.error('Prisma Error', {
    message: e.message,
    target: e.target,
  });
});

// Warn logging
prisma.$on('warn', (e) => {
  logger.warn('Prisma Warning', {
    message: e.message,
    target: e.target,
  });
});

// Graceful shutdown
async function disconnect(): Promise<void> {
  await prisma.$disconnect();
  logger.info('Prisma disconnected');
}

process.on('beforeExit', () => {
  void disconnect();
});
