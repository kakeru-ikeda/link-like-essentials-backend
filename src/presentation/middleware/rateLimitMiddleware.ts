import type { NextFunction, Request, RequestHandler, Response } from 'express';

import { getEnvVar } from '@/config/env';
import { RedisClient } from '@/infrastructure/cache/RedisClient';
import { logger } from '@/infrastructure/logger/Logger';
import { RateLimitService } from '@/infrastructure/rateLimit/RateLimitService';

const RATE_LIMIT_MAX = parseInt(getEnvVar('RATE_LIMIT_MAX', '100'), 10);
const RATE_LIMIT_WINDOW_SEC = parseInt(
  getEnvVar('RATE_LIMIT_WINDOW_SEC', '60'),
  10
);

function getClientIp(req: Request): string {
  const forwarded = req.headers['x-forwarded-for'];
  if (typeof forwarded === 'string') {
    const first = forwarded.split(',')[0];
    return first !== undefined ? first.trim() : (req.ip ?? 'unknown');
  }
  return req.ip ?? 'unknown';
}

export function createRateLimitMiddleware(): RequestHandler {
  const rateLimitService = new RateLimitService(
    RedisClient.getInstance(),
    RATE_LIMIT_MAX,
    RATE_LIMIT_WINDOW_SEC
  );

  return (req: Request, res: Response, next: NextFunction): void => {
    const ip = getClientIp(req);
    rateLimitService
      .check(ip)
      .then((result) => {
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
      })
      .catch(next);
  };
}
