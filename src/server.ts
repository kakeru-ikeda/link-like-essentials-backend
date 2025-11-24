import express from 'express';
import cors from 'cors';
import { expressMiddleware } from '@apollo/server/express4';

import { apolloServer } from './config/apollo';
import { createContext } from './config/context';
import { requestLogger } from './presentation/middleware/requestLogger';
import { logger } from './infrastructure/logger/Logger';
import { prisma } from './infrastructure/database/client';
import { RedisClient } from './infrastructure/cache/RedisClient';

const PORT = process.env.PORT || 4000;
const CORS_ORIGIN = process.env.CORS_ORIGIN || 'http://localhost:3000';
const isDevelopment = process.env.NODE_ENV === 'development';

async function startServer(): Promise<void> {
    try {
        // Express app作成
        const app = express();

        // ミドルウェア
        app.use(
            cors({
                origin: isDevelopment
                    ? ['http://localhost:3000', 'https://studio.apollographql.com']
                    : CORS_ORIGIN,
                credentials: true,
            })
        );
        app.use(express.json());
        app.use(requestLogger);

        // ヘルスチェック
        app.get('/health', (req, res) => {
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
