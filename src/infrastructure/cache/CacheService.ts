import { logger } from '../logger/Logger';

export interface IRedisClient {
  get<T = string>(key: string): Promise<T | null>;
  set(
    key: string,
    value: string,
    options?: {
      ex?: number;
    }
  ): Promise<unknown>;
  del(...keys: string[]): Promise<number>;
  keys(pattern: string): Promise<string[]>;
  exists(key: string): Promise<number>;
  ttl(key: string): Promise<number>;
}

export class CacheService {
  constructor(private readonly redis: IRedisClient) {}

  async get<T>(key: string): Promise<T | null> {
    try {
      const data = await this.redis.get<unknown>(key);
      if (data === null) return null;

      if (typeof data !== 'string') {
        return data as T;
      }

      return JSON.parse(data) as T;
    } catch (error) {
      logger.error('Cache get error', {
        key,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      return null;
    }
  }

  async set(key: string, value: unknown, ttlSeconds?: number): Promise<void> {
    try {
      const serialized = JSON.stringify(value);

      if (ttlSeconds) {
        await this.redis.set(key, serialized, { ex: ttlSeconds });
      } else {
        await this.redis.set(key, serialized);
      }

      logger.debug('Cache set', { key, ttl: ttlSeconds });
    } catch (error) {
      logger.error('Cache set error', {
        key,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  async del(key: string): Promise<void> {
    try {
      await this.redis.del(key);
      logger.debug('Cache deleted', { key });
    } catch (error) {
      logger.error('Cache delete error', {
        key,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  async invalidatePattern(pattern: string): Promise<void> {
    try {
      const keys = await this.redis.keys(pattern);
      if (keys.length > 0) {
        await this.redis.del(...keys);
        logger.debug('Cache pattern invalidated', {
          pattern,
          count: keys.length,
        });
      }
    } catch (error) {
      logger.error('Cache pattern invalidation error', {
        pattern,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  async exists(key: string): Promise<boolean> {
    try {
      const result = await this.redis.exists(key);
      return result === 1;
    } catch (error) {
      logger.error('Cache exists check error', {
        key,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      return false;
    }
  }

  async ttl(key: string): Promise<number> {
    try {
      return await this.redis.ttl(key);
    } catch (error) {
      logger.error('Cache TTL check error', {
        key,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      return -1;
    }
  }
}
