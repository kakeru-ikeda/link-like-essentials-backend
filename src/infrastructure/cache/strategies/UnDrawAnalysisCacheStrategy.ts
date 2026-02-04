import type { UnDrawAnalysis } from '@/domain/entities/TraitAnalysis';

import type { CacheService } from '../CacheService';

const TTL = {
  ANALYSIS: 12 * 60 * 60, // 12時間
} as const;

export class UnDrawAnalysisCacheStrategy {
  constructor(private readonly cache: CacheService) {}

  async getByCardId(cardId: number): Promise<UnDrawAnalysis | null> {
    return await this.cache.get<UnDrawAnalysis>(`un_draw:card:${cardId}`);
  }

  async setByCardId(cardId: number, analysis: UnDrawAnalysis): Promise<void> {
    await this.cache.set(`un_draw:card:${cardId}`, analysis, TTL.ANALYSIS);
  }

  async getByAccessoryId(accessoryId: number): Promise<UnDrawAnalysis | null> {
    return await this.cache.get<UnDrawAnalysis>(
      `un_draw:accessory:${accessoryId}`
    );
  }

  async setByAccessoryId(
    accessoryId: number,
    analysis: UnDrawAnalysis
  ): Promise<void> {
    await this.cache.set(
      `un_draw:accessory:${accessoryId}`,
      analysis,
      TTL.ANALYSIS
    );
  }
}
