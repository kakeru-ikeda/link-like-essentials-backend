import type { HeartCollectAnalysis } from '@/domain/entities/TraitAnalysis';
import type { IHeartCollectAnalysisRepository } from '@/domain/repositories/ITraitAnalysisRepository';
import type { HeartCollectAnalysisCacheStrategy } from '@/infrastructure/cache/strategies/HeartCollectAnalysisCacheStrategy';

export class HeartCollectAnalysisService {
  constructor(
    private readonly repository: IHeartCollectAnalysisRepository,
    private readonly cacheStrategy: HeartCollectAnalysisCacheStrategy
  ) {}

  async findByCardId(cardId: number): Promise<HeartCollectAnalysis | null> {
    const cached = await this.cacheStrategy.getByCardId(cardId);
    if (cached) return cached;

    const result = await this.repository.findByCardId(cardId);
    if (result) {
      await this.cacheStrategy.setByCardId(cardId, result);
    }

    return result;
  }

  async findByAccessoryId(
    accessoryId: number
  ): Promise<HeartCollectAnalysis | null> {
    const cached = await this.cacheStrategy.getByAccessoryId(accessoryId);
    if (cached) return cached;

    const result = await this.repository.findByAccessoryId(accessoryId);
    if (result) {
      await this.cacheStrategy.setByAccessoryId(accessoryId, result);
    }

    return result;
  }
}
