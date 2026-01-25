import { Redis } from '@upstash/redis';

import { getEnvVar, getOptionalEnvVar } from '@/config/env';

import type { IRedisClient } from './CacheService';
import { logger } from '../logger/Logger';
import { SentryService } from '../monitoring/SentryService';

type RedisRole = 'primary' | 'fallback';

const DEFAULT_LOCAL_REDIS_URL = 'http://localhost:8079';
const DEFAULT_LOCAL_REDIS_TOKEN = 'example_token';
const DEFAULT_TIMEOUT_MS = 10_000;
const HANDSHAKE_KEY = '__sukisuki_redis_handshake__';
const POLLING_INTERVAL_MS = 30 * 60 * 1000;

const getErrorMessage = (error: unknown): string =>
  error instanceof Error ? error.message : 'Unknown error';

const withTimeout = async <T>(
  promise: Promise<T>,
  timeoutMs: number,
  label: string
): Promise<T> => {
  let timer: NodeJS.Timeout | undefined;

  const timeoutPromise = new Promise<never>((_resolve, reject) => {
    timer = setTimeout(() => {
      reject(new Error(`${label} timeout after ${timeoutMs}ms`));
    }, timeoutMs);
  });

  try {
    return await Promise.race([promise, timeoutPromise]);
  } finally {
    if (timer) clearTimeout(timer);
  }
};

class FailoverRedisClient implements IRedisClient {
  private current: RedisRole;
  private readonly primary?: Redis;
  private readonly fallback: Redis;
  private readonly timeoutMs: number;
  private readonly enablePolling: boolean;
  private pollingTimer?: NodeJS.Timeout;
  private pollingInitTimer?: NodeJS.Timeout;
  private hasReportedPrimaryFailure = false;

  constructor(
    primary: Redis | undefined,
    fallback: Redis,
    timeoutMs: number,
    enablePolling: boolean
  ) {
    this.primary = primary;
    this.fallback = fallback;
    this.timeoutMs = timeoutMs;
    this.enablePolling = enablePolling;
    this.current = primary ? 'primary' : 'fallback';
  }

  private async execute<T>(
    operation: (client: Redis) => Promise<T>
  ): Promise<T> {
    if (this.current === 'primary' && this.primary) {
      try {
        return await withTimeout(
          operation(this.primary),
          this.timeoutMs,
          'sukisuki-club-http-redis'
        );
      } catch (error) {
        const errorMsg = getErrorMessage(error);
        
        // 413 Request Entity Too Largeはリクエストサイズの問題であり、Redis自体の問題ではない
        // この場合はfallbackせずにそのままエラーをスロー
        if (errorMsg.includes('413') || errorMsg.includes('Request Entity Too Large')) {
          logger.warn('Primary Redis request too large (413), not switching to fallback', {
            error: errorMsg,
          });
          throw error;
        }

        // その他のエラー（404含む）はRedis接続の問題と判断してfallback
        this.current = 'fallback';
        if (!this.hasReportedPrimaryFailure) {
          this.hasReportedPrimaryFailure = true;
          SentryService.captureMessage(
            'Primary Redis unreachable, switched to fallback (sukisuki-club-http-redis)',
            'warning'
          );
        }
        logger.warn('Primary Redis unreachable, switched to fallback', {
          error: errorMsg,
        });
      }
    }

    return await operation(this.fallback);
  }

  async get<T = string>(key: string): Promise<T | null> {
    return await this.execute((client) => client.get<T>(key));
  }

  async set(
    key: string,
    value: string,
    options?: {
      ex?: number;
    }
  ): Promise<unknown> {
    const redisOptions = options?.ex ? { ex: options.ex } : undefined;
    if (redisOptions) {
      return await this.execute((client) =>
        client.set(key, value, redisOptions)
      );
    }
    return await this.execute((client) => client.set(key, value));
  }

  async del(...keys: string[]): Promise<number> {
    return await this.execute((client) => client.del(...keys));
  }

  async keys(pattern: string): Promise<string[]> {
    return await this.execute((client) => client.keys(pattern));
  }

  async exists(key: string): Promise<number> {
    return await this.execute((client) => client.exists(key));
  }

  async ttl(key: string): Promise<number> {
    return await this.execute((client) => client.ttl(key));
  }

  private async handshakePrimary(): Promise<boolean> {
    if (!this.primary) return false;

    try {
      await withTimeout(
        this.primary.get<string>(HANDSHAKE_KEY),
        this.timeoutMs,
        'sukisuki-club-http-redis handshake'
      );
      if (this.current !== 'primary') {
        this.current = 'primary';
        this.hasReportedPrimaryFailure = false;
        logger.info('Primary Redis restored (sukisuki-club-http-redis)');
      }
      return true;
    } catch (error) {
      logger.warn('Primary Redis handshake failed', {
        error: getErrorMessage(error),
      });
      return false;
    }
  }

  startPolling(): void {
    if (!this.enablePolling || !this.primary) return;
    if (this.pollingTimer || this.pollingInitTimer) return;

    const now = new Date();
    const minutes = now.getMinutes();
    const nextMinutes = minutes < 30 ? 30 : 60;
    const msToNext =
      (nextMinutes - minutes) * 60 * 1000 -
      now.getSeconds() * 1000 -
      now.getMilliseconds();

    this.pollingInitTimer = setTimeout(
      () => {
        void this.handshakePrimary();
        this.pollingTimer = setInterval(() => {
          void this.handshakePrimary();
        }, POLLING_INTERVAL_MS);
      },
      Math.max(msToNext, 0)
    );
  }

  stopPolling(): void {
    if (this.pollingInitTimer) {
      clearTimeout(this.pollingInitTimer);
      this.pollingInitTimer = undefined;
    }
    if (this.pollingTimer) {
      clearInterval(this.pollingTimer);
      this.pollingTimer = undefined;
    }
  }
}

export class RedisClient {
  private static instance: IRedisClient;
  private static failoverClient?: FailoverRedisClient;

  private constructor() {}

  static getInstance(): IRedisClient {
    if (!RedisClient.instance) {
      const isProduction = process.env.NODE_ENV === 'production';

      if (!isProduction) {
        const url = getEnvVar(
          'UPSTASH_REDIS_REST_URL',
          DEFAULT_LOCAL_REDIS_URL
        );
        const token = getEnvVar(
          'UPSTASH_REDIS_REST_TOKEN',
          DEFAULT_LOCAL_REDIS_TOKEN
        );
        const localRedis = new Redis({ url, token });
        const client = new FailoverRedisClient(
          undefined,
          localRedis,
          DEFAULT_TIMEOUT_MS,
          false
        );
        RedisClient.instance = client;
        RedisClient.failoverClient = client;
        logger.info('Local Redis client initialized', { url });
        return RedisClient.instance;
      }

      const primaryUrl = getOptionalEnvVar('SUKISUKI_CLUB_HTTP_REDIS_URL');
      const primaryToken = getOptionalEnvVar('SUKISUKI_CLUB_HTTP_REDIS_TOKEN');
      const fallbackUrl = getEnvVar('UPSTASH_REDIS_REST_URL');
      const fallbackToken = getEnvVar('UPSTASH_REDIS_REST_TOKEN');
      const timeoutMs = (() => {
        const raw = getOptionalEnvVar('SUKISUKI_CLUB_HTTP_REDIS_TIMEOUT_MS');
        if (!raw) return DEFAULT_TIMEOUT_MS;
        const parsed = Number.parseInt(raw, 10);
        return Number.isNaN(parsed) || parsed <= 0
          ? DEFAULT_TIMEOUT_MS
          : parsed;
      })();

      let primaryClient: Redis | undefined;
      if (primaryUrl && primaryToken) {
        primaryClient = new Redis({
          url: primaryUrl,
          token: primaryToken,
        });
      }
      const fallbackClient = new Redis({
        url: fallbackUrl,
        token: fallbackToken,
      });

      if (primaryClient) {
        logger.info('Primary Redis configured (sukisuki-club-http-redis)', {
          url: primaryUrl,
        });
      } else {
        logger.warn('Primary Redis not configured, using Upstash only');
      }

      logger.info('Fallback Redis configured (Upstash)', { url: fallbackUrl });

      const client = new FailoverRedisClient(
        primaryClient,
        fallbackClient,
        timeoutMs,
        true
      );

      RedisClient.instance = client;
      RedisClient.failoverClient = client;
      logger.info('Redis client initialized with failover');
    }

    return RedisClient.instance;
  }

  static startPolling(): void {
    RedisClient.failoverClient?.startPolling();
  }

  static stopPolling(): void {
    RedisClient.failoverClient?.stopPolling();
  }

  static disconnect(): void {
    if (RedisClient.instance) {
      RedisClient.stopPolling();
      logger.info('Redis client shutdown requested');
    }
  }
}
