import { expressMiddleware } from '@apollo/server/express4';
import * as Sentry from '@sentry/node';
import cors from 'cors';
import express from 'express';

import { apolloServer } from './config/apollo';
import { createContext } from './config/context';
import { RedisClient } from './infrastructure/cache/RedisClient';
import { prisma } from './infrastructure/database/client';
import { logger } from './infrastructure/logger/Logger';
import { SentryService } from './infrastructure/monitoring/SentryService';
import { requestLogger } from './presentation/middleware/requestLogger';

const PORT = process.env.PORT || 4000;
const LLES_CORS_ORIGIN =
  process.env.LLES_CORS_ORIGIN || 'http://localhost:3000';
const LLES_VERCEL_PROJECT_NAME = process.env.LLES_VERCEL_PROJECT_NAME;
const isDevelopment = process.env.NODE_ENV === 'development';

// CORS_ORIGINをカンマ区切りで配列に変換
const getAllowedOrigins = (): string[] => {
  if (isDevelopment) {
    return [
      'http://localhost:3000',
      'http://localhost:5173',
      'https://studio.apollographql.com',
    ];
  }
  return LLES_CORS_ORIGIN.split(',').map((origin) => origin.trim());
};

/**
 * OriginがCORS許可リストに含まれるか、またはVercelプレビュービルドかを判定
 */
const isAllowedOrigin = (origin: string | undefined): boolean => {
  if (!origin) return false;

  const allowedOrigins = getAllowedOrigins();

  // 静的な許可リストに含まれる
  if (allowedOrigins.includes(origin)) {
    return true;
  }

  // Vercelプレビュービルド (https://*-{PROJECT_NAME}.vercel.app)
  if (LLES_VERCEL_PROJECT_NAME) {
    const vercelPreviewPattern = new RegExp(
      `^https:\\/\\/.*-${LLES_VERCEL_PROJECT_NAME.replace(/[.*+?^${}()|[\\]\\\\]/g, '\\\\$&')}\\.vercel\\.app$`
    );
    if (vercelPreviewPattern.test(origin)) {
      logger.info(`CORS: Allowed Vercel preview origin: ${origin}`);
      return true;
    }
  }

  return false;
};

async function startServer(): Promise<void> {
  try {
    // Sentry初期化（最優先）
    SentryService.initialize();

    // Express app作成
    const app = express();

    // ミドルウェア
    app.use(
      cors({
        origin: (origin, callback) => {
          if (isAllowedOrigin(origin)) {
            callback(null, true);
          } else {
            logger.warn(`CORS: Blocked origin: ${origin || 'undefined'}`);
            callback(null, false);
          }
        },
        credentials: true,
      })
    );
    app.use(express.json());
    app.use(requestLogger);

    // ヘルスチェック
    app.get('/health', (_req, res) => {
      res.status(200).json({ status: 'ok' });
    });

    // Apollo Server起動
    await apolloServer.start();
    logger.info('Apollo Server started');

    // Redisフェイルオーバーのポーリング開始
    RedisClient.startPolling();

    // GraphQLエンドポイント
    app.use(
      '/graphql',
      expressMiddleware(apolloServer, {
        context: async ({ req }) => await createContext(req),
      })
    );

    // Sentryエラーハンドラー（GraphQL後に配置）
    Sentry.setupExpressErrorHandler(app);

    // サーバー起動
    app.listen(PORT, () => {
      logger.info(`Server running on http://localhost:${PORT}/graphql`);
    });

    // Graceful shutdown
    const shutdown = async (): Promise<void> => {
      logger.info('Shutting down gracefully...');

      await SentryService.close();
      await apolloServer.stop();
      await prisma.$disconnect();
      RedisClient.disconnect();

      process.exit(0);
    };

    process.on('SIGTERM', () => {
      void shutdown();
    });
    process.on('SIGINT', () => {
      void shutdown();
    });
  } catch (error) {
    SentryService.captureException(
      error instanceof Error ? error : new Error('Unknown server error')
    );
    logger.error('Failed to start server', {
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    process.exit(1);
  }
}

void startServer();
