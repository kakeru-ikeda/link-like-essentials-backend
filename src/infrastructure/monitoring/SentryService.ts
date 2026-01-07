import * as Sentry from '@sentry/node';
import { nodeProfilingIntegration } from '@sentry/profiling-node';

import { logger } from '../logger/Logger';

export class SentryService {
  static initialize(): void {
    const dsn = process.env.SENTRY_DSN;
    const environment = process.env.NODE_ENV || 'development';

    if (!dsn) {
      logger.warn('SENTRY_DSN is not set. Sentry will be disabled.');
      return;
    }

    Sentry.init({
      dsn,
      environment,
      enabled: environment === 'production',

      // パフォーマンス監視
      tracesSampleRate: 1.0,
      profilesSampleRate: 1.0,

      // eslint-disable-next-line @typescript-eslint/no-unsafe-call
      integrations: [nodeProfilingIntegration()],

      // GraphQL操作のフィルタリング
      beforeSend(event, _hint) {
        // IntrospectionQueryは除外（ノイズ削減）
        if (event.transaction?.includes('IntrospectionQuery')) {
          return null;
        }
        return event;
      },
    });

    logger.info('Sentry initialized', { environment, enabled: environment === 'production' });
  }

  static captureException(
    error: Error,
    context?: Record<string, unknown>
  ): string {
    return Sentry.captureException(error, { extra: context });
  }

  static captureMessage(
    message: string,
    level: Sentry.SeverityLevel = 'info'
  ): string {
    return Sentry.captureMessage(message, level);
  }

  static setUser(userId: string): void {
    Sentry.setUser({ id: userId });
  }

  static async close(): Promise<void> {
    await Sentry.close(2000);
  }
}
