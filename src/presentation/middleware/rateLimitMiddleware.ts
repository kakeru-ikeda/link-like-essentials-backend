import type { NextFunction, Request, Response } from 'express';

import { getEnvVar } from '@/config/env';
import { RedisClient } from '@/infrastructure/cache/RedisClient';
import { RateLimitService } from '@/infrastructure/rateLimit/RateLimitService';
import { logger } from '@/infrastructure/logger/Logger';

const RATE_LIMIT_MAX = parseInt(
  getEnvVar('RATE_LIMIT_MAX', '100'),
  10
);
const RATE_LIMIT_WINDOW_SEC = parseInt(
  getEnvVar('RATE_LIMIT_WINDOW_SEC', '60'),
  10
);

function getClientIp(req: Request): string {
  const forwarded = req.headers['x-forwarded-for'];
  if (typeof forwarded === 'string') {
    const first = forwarded.split(',')[0];
    return first !== undefined ? first.trim() : req.ip ?? 'unknown';
  }
  return req.ip ?? 'unknown';
}

export function createRateLimitMiddleware() {
  const rateLimitService = new RateLimitService(
    RedisClient.getInstance(),
    RATE_LIMIT_MAX,
    RATE_LIMIT_WINDOW_SEC
  );

  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const ip = getClientIp(req);
    const result = await rateLimitService.check(ip);

    res.setHeader('X-RateLimit-Limit', result.limit);
    res.setHeader('X-RateLimit-Remaining', result.remaining);
    res.setHeader('X-RateLimit-Reset', result.resetAt);

    if (!result.allowed) {
      res.setHeader('Retry-After', result.retryAfter);

      logger.warn('Rate limit exceeded', { ip, limit: result.limit });

      res.status(429).json({
        errors: [
          {
            message:
              'リクエスト数の上限に達しました。しばらく待ってから再試行してください。',
            extensions: {
              code: 'TOO_MANY_REQUESTS',
              retryAfter: result.retryAfter,
            },
          },
        ],
      });
      return;
    }

    next();
  };
}
