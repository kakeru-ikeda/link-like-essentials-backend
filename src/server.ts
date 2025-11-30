import { expressMiddleware } from '@apollo/server/express4';
import cors from 'cors';
import express from 'express';

import { apolloServer } from './config/apollo';
import { createContext } from './config/context';
import { RedisClient } from './infrastructure/cache/RedisClient';
import { prisma } from './infrastructure/database/client';
import { logger } from './infrastructure/logger/Logger';
import { requestLogger } from './presentation/middleware/requestLogger';

const PORT = process.env.PORT || 4000;
const LLES_CORS_ORIGIN =
  process.env.LLES_CORS_ORIGIN || 'http://localhost:3000';
const isDevelopment = process.env.NODE_ENV === 'development';

// CORS_ORIGINをカンマ区切りで配列に変換
const getAllowedOrigins = (): string[] => {
  if (isDevelopment) {
    return ['http://localhost:3000', 'https://studio.apollographql.com'];
  }
  return LLES_CORS_ORIGIN.split(',').map((origin) => origin.trim());
};

async function startServer(): Promise<void> {
  try {
    // Express app作成
    const app = express();

    const allowedOrigins = getAllowedOrigins();

    // ミドルウェア
    app.use(
      cors({
        origin: allowedOrigins,
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

    // GraphQLエンドポイント
    app.use(
      '/graphql',
      expressMiddleware(apolloServer, {
        context: async ({ req }) => await createContext(req),
      })
    );

    // サーバー起動
    app.listen(PORT, () => {
      logger.info(`Server running on http://localhost:${PORT}/graphql`);
    });

    // Graceful shutdown
    const shutdown = async (): Promise<void> => {
      logger.info('Shutting down gracefully...');

      await apolloServer.stop();
      await prisma.$disconnect();
      await RedisClient.disconnect();

      process.exit(0);
    };

    process.on('SIGTERM', () => {
      void shutdown();
    });
    process.on('SIGINT', () => {
      void shutdown();
    });
  } catch (error) {
    logger.error('Failed to start server', {
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    process.exit(1);
  }
}

void startServer();
