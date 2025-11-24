import type { Request } from 'express';

import type { GraphQLContext } from '@/presentation/graphql/context';
import { AuthService } from '@/infrastructure/auth/AuthService';
import { CardService } from '@/application/services/CardService';
import { CardDetailService } from '@/application/services/CardDetailService';
import { AccessoryService } from '@/application/services/AccessoryService';
import { CardRepository } from '@/infrastructure/database/repositories/CardRepository';
import { CardDetailRepository } from '@/infrastructure/database/repositories/CardDetailRepository';
import { AccessoryRepository } from '@/infrastructure/database/repositories/AccessoryRepository';
import { prisma } from '@/infrastructure/database/client';
import { RedisClient } from '@/infrastructure/cache/RedisClient';
import { CacheService } from '@/infrastructure/cache/CacheService';
import { CardCacheStrategy } from '@/infrastructure/cache/strategies/CardCacheStrategy';
import { DetailCacheStrategy } from '@/infrastructure/cache/strategies/DetailCacheStrategy';
import { logger } from '@/infrastructure/logger/Logger';

export async function createContext(req: Request): Promise<GraphQLContext> {
    const token = req.headers.authorization?.replace('Bearer ', '');

    let user: GraphQLContext['user'] | undefined;

    if (token) {
        try {
            const authService = new AuthService();
            user = await authService.verifyAndGetUser(token);
        } catch (error) {
            logger.warn('Token verification failed', {
                error: error instanceof Error ? error.message : 'Unknown error',
            });
        }
    }

    // インスタンス生成
    const redis = RedisClient.getInstance();
    const cacheService = new CacheService(redis);
    const cardCacheStrategy = new CardCacheStrategy(cacheService);
    const detailCacheStrategy = new DetailCacheStrategy(cacheService);

    const cardRepository = new CardRepository(prisma);
    const cardDetailRepository = new CardDetailRepository(prisma);
    const accessoryRepository = new AccessoryRepository(prisma);

    const cardService = new CardService(cardRepository, cardCacheStrategy);
    const cardDetailService = new CardDetailService(
        cardDetailRepository,
        detailCacheStrategy
    );
    const accessoryService = new AccessoryService(accessoryRepository);

    return {
        user,
        dataSources: {
            cardService,
            cardDetailService,
            accessoryService,
        },
    };
}
