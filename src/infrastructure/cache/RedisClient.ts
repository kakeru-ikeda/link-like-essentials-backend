import { Redis } from '@upstash/redis';

import { logger } from '../logger/Logger';

function getEnvVarOrDefault(key: string, defaultValue?: string): string {
  const value = process.env[key] ?? defaultValue;
  if (!value) {
    throw new Error(`Environment variable ${key} is not set`);
  }
  return value;
}

export class RedisClient {
  private static instance: Redis;

  private constructor() {}

  static getInstance(): Redis {
    if (!RedisClient.instance) {
      const isProduction = process.env.NODE_ENV === 'production';
      const url = isProduction
        ? getEnvVarOrDefault('UPSTASH_REDIS_REST_URL')
        : getEnvVarOrDefault('UPSTASH_REDIS_REST_URL', 'http://localhost:8079');
      const token = isProduction
        ? getEnvVarOrDefault('UPSTASH_REDIS_REST_TOKEN')
        : getEnvVarOrDefault('UPSTASH_REDIS_REST_TOKEN', 'example_token');

      RedisClient.instance = new Redis({
        url,
        token,
      });

      logger.info('Upstash Redis client initialized');
    }

    return RedisClient.instance;
  }

  static disconnect(): void {
    if (RedisClient.instance) {
      logger.info('Upstash Redis client shutdown requested');
    }
  }
}
