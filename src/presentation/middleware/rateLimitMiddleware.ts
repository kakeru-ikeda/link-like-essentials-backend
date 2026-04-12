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

export function createRateLimitMiddleware(): RequestHandler {
  const rateLimitService = new RateLimitService(
    RedisClient.getInstance(),
    RATE_LIMIT_MAX,
    RATE_LIMIT_WINDOW_SEC
  );

  return (req: Request, res: Response, next: NextFunction): void => {
    const ip = req.ip ?? 'unknown';
    rateLimitService
      .check(ip)
      .then((result) => {
        res.setHeader('X-RateLimit-Limit', result.limit);
        res.setHeader('X-RateLimit-Remaining', result.remaining);
        res.setHeader('X-RateLimit-Reset', result.resetAt);

        if (!result.allowed) {
          res.setHeader('Retry-After', result.retryAfter);

          logger.warn('Rate limit exceeded', { ip, limit: result.limit });

          const isGraphQL = req.path.startsWith('/graphql');

          if (isGraphQL) {
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
          } else {
            res.status(429).json({
              error: {
                code: 'TOO_MANY_REQUESTS',
                message:
                  'リクエスト数の上限に達しました。しばらく待ってから再試行してください。',
              },
            });
          }
          return;
        }

        next();
      })
      .catch(next);
  };
}
