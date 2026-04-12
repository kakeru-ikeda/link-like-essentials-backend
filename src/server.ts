import { expressMiddleware } from '@apollo/server/express4';
import * as Sentry from '@sentry/node';
import cors from 'cors';
import express from 'express';
import swaggerUi from 'swagger-ui-express';

import { apolloServer } from './config/apollo';
import { createContext } from './config/context';
import { swaggerSpec } from './config/swagger';
import { RedisClient } from './infrastructure/cache/RedisClient';
import { prisma } from './infrastructure/database/client';
import { logger } from './infrastructure/logger/Logger';
import { SentryService } from './infrastructure/monitoring/SentryService';
import { createRateLimitMiddleware } from './presentation/middleware/rateLimitMiddleware';
import { requestLogger } from './presentation/middleware/requestLogger';
import { restErrorHandler } from './presentation/rest/middleware/restErrorHandler';
import { apiRouter } from './presentation/rest/routes';

const PORT = process.env.PORT || 4000;

async function startServer(): Promise<void> {
  try {
    // Sentry初期化（最優先）
    SentryService.initialize();

    // Express app作成
    const app = express();

    // ミドルウェア
    app.use(cors());
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

    app.use('/api', createRateLimitMiddleware(), apiRouter);
    app.use('/api', restErrorHandler);

    app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
    app.get('/api-docs.json', (_req, res) => {
      res.setHeader('Content-Type', 'application/json');
      res.send(swaggerSpec);
    });

    app.use(
      '/graphql',
      createRateLimitMiddleware(),
      expressMiddleware(apolloServer, {
        context: ({ req }) => Promise.resolve(createContext(req)),
      })
    );

    Sentry.setupExpressErrorHandler(app);

    // サーバー起動
    app.listen(PORT, () => {
      logger.info(`Server running on http://localhost:${PORT}/graphql`);
      logger.info(`REST API running on http://localhost:${PORT}/api`);
      logger.info(`Swagger UI running on http://localhost:${PORT}/api-docs`);
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
