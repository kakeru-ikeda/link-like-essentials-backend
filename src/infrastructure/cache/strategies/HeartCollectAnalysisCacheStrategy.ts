import type { HeartCollectAnalysis } from '@/domain/entities/TraitAnalysis';

import type { CacheService } from '../CacheService';

const TTL = {
  ANALYSIS: 12 * 60 * 60, // 12時間
} as const;

export class HeartCollectAnalysisCacheStrategy {
  constructor(private readonly cache: CacheService) {}

  async getByCardId(cardId: number): Promise<HeartCollectAnalysis | null> {
    return await this.cache.get<HeartCollectAnalysis>(
      `heart_collect:card:${cardId}`
    );
  }

  async setByCardId(
    cardId: number,
    analysis: HeartCollectAnalysis
  ): Promise<void> {
    await this.cache.set(
      `heart_collect:card:${cardId}`,
      analysis,
      TTL.ANALYSIS
    );
  }

  async getByAccessoryId(
    accessoryId: number
  ): Promise<HeartCollectAnalysis | null> {
    return await this.cache.get<HeartCollectAnalysis>(
      `heart_collect:accessory:${accessoryId}`
    );
  }

  async setByAccessoryId(
    accessoryId: number,
    analysis: HeartCollectAnalysis
  ): Promise<void> {
    await this.cache.set(
      `heart_collect:accessory:${accessoryId}`,
      analysis,
      TTL.ANALYSIS
    );
  }
}
