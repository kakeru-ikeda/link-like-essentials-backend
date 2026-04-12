import type { IRedisClient } from '@/infrastructure/cache/CacheService';
import { logger } from '@/infrastructure/logger/Logger';

export interface RateLimitResult {
  allowed: boolean;
  limit: number;
  remaining: number;
  resetAt: number;
  retryAfter: number;
}

export class RateLimitService {
  private readonly limit: number;
  private readonly windowSec: number;

  constructor(
    private readonly redis: IRedisClient,
    limit: number,
    windowSec: number
  ) {
    this.limit = limit;
    this.windowSec = windowSec;
  }

  async check(ip: string): Promise<RateLimitResult> {
    const key = `ratelimit:${ip}`;

    try {
      // INCR はアトミック操作。カウンターが初めて作成される場合は 1 を返す
      const current = await this.redis.incr(key);

      if (current === 1) {
        await this.redis.expire(key, this.windowSec);
      }

      const ttl = await this.redis.ttl(key);
      const remaining = Math.max(0, this.limit - current);
      const resetAt =
        Math.floor(Date.now() / 1000) + (ttl > 0 ? ttl : this.windowSec);
      const retryAfter = ttl > 0 ? ttl : this.windowSec;

      return {
        allowed: current <= this.limit,
        limit: this.limit,
        remaining,
        resetAt,
        retryAfter,
      };
    } catch (error) {
      // Redis 障害時はフェイルオープン（リクエストを通す）
      logger.error('RateLimitService: Redis error, failing open', {
        error: error instanceof Error ? error.message : 'Unknown error',
        ip,
      });
      return {
        allowed: true,
        limit: this.limit,
        remaining: this.limit,
        resetAt: Math.floor(Date.now() / 1000) + this.windowSec,
        retryAfter: 0,
      };
    }
  }
}
