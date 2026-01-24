import { Redis } from '@upstash/redis';

import { getEnvVar } from '@/config/env';

import { logger } from '../logger/Logger';

export class RedisClient {
  private static instance: Redis;

  private constructor() {}

  static getInstance(): Redis {
    if (!RedisClient.instance) {
      const isProduction = process.env.NODE_ENV === 'production';
      const url = isProduction
        ? getEnvVar('UPSTASH_REDIS_REST_URL')
        : getEnvVar('UPSTASH_REDIS_REST_URL', 'http://localhost:8079');
      const token = isProduction
        ? getEnvVar('UPSTASH_REDIS_REST_TOKEN')
        : getEnvVar('UPSTASH_REDIS_REST_TOKEN', 'example_token');

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
