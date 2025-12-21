import type { Request } from 'express';

import { AccessoryService } from '@/application/services/AccessoryService';
import { CardDetailService } from '@/application/services/CardDetailService';
import { CardService } from '@/application/services/CardService';
import { LiveGrandPrixService } from '@/application/services/LiveGrandPrixService';
import { SongService } from '@/application/services/SongService';
import { AuthService } from '@/infrastructure/auth/AuthService';
import { CacheService } from '@/infrastructure/cache/CacheService';
import { RedisClient } from '@/infrastructure/cache/RedisClient';
import { CardCacheStrategy } from '@/infrastructure/cache/strategies/CardCacheStrategy';
import { DetailCacheStrategy } from '@/infrastructure/cache/strategies/DetailCacheStrategy';
import { LiveGrandPrixCacheStrategy } from '@/infrastructure/cache/strategies/LiveGrandPrixCacheStrategy';
import { SongCacheStrategy } from '@/infrastructure/cache/strategies/SongCacheStrategy';
import { prisma } from '@/infrastructure/database/client';
import { AccessoryRepository } from '@/infrastructure/database/repositories/AccessoryRepository';
import { CardDetailRepository } from '@/infrastructure/database/repositories/CardDetailRepository';
import { CardRepository } from '@/infrastructure/database/repositories/CardRepository';
import { LiveGrandPrixRepository } from '@/infrastructure/database/repositories/LiveGrandPrixRepository';
import { SongRepository } from '@/infrastructure/database/repositories/SongRepository';
import { logger } from '@/infrastructure/logger/Logger';
import type { GraphQLContext } from '@/presentation/graphql/context';

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
  const songCacheStrategy = new SongCacheStrategy(cacheService);
  const liveGrandPrixCacheStrategy = new LiveGrandPrixCacheStrategy(
    cacheService
  );

  const cardRepository = new CardRepository(prisma);
  const cardDetailRepository = new CardDetailRepository(prisma);
  const accessoryRepository = new AccessoryRepository(prisma);
  const songRepository = new SongRepository(prisma);
  const liveGrandPrixRepository = new LiveGrandPrixRepository(prisma);

  const cardService = new CardService(cardRepository, cardCacheStrategy);
  const cardDetailService = new CardDetailService(
    cardDetailRepository,
    detailCacheStrategy
  );
  const accessoryService = new AccessoryService(accessoryRepository);
  const songService = new SongService(songRepository, songCacheStrategy);
  const liveGrandPrixService = new LiveGrandPrixService(
    liveGrandPrixRepository,
    liveGrandPrixCacheStrategy
  );

  return {
    user,
    dataSources: {
      cardService,
      cardDetailService,
      accessoryService,
      songService,
      liveGrandPrixService,
    },
  };
}
