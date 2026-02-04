import type { UnDrawAnalysis } from '@/domain/entities/TraitAnalysis';
import type { IUnDrawAnalysisRepository } from '@/domain/repositories/ITraitAnalysisRepository';
import type { UnDrawAnalysisCacheStrategy } from '@/infrastructure/cache/strategies/UnDrawAnalysisCacheStrategy';

export class UnDrawAnalysisService {
  constructor(
    private readonly repository: IUnDrawAnalysisRepository,
    private readonly cacheStrategy: UnDrawAnalysisCacheStrategy
  ) {}

  async findByCardId(cardId: number): Promise<UnDrawAnalysis | null> {
    const cached = await this.cacheStrategy.getByCardId(cardId);
    if (cached) return cached;

    const result = await this.repository.findByCardId(cardId);
    if (result) {
      await this.cacheStrategy.setByCardId(cardId, result);
    }

    return result;
  }

  async findByAccessoryId(accessoryId: number): Promise<UnDrawAnalysis | null> {
    const cached = await this.cacheStrategy.getByAccessoryId(accessoryId);
    if (cached) return cached;

    const result = await this.repository.findByAccessoryId(accessoryId);
    if (result) {
      await this.cacheStrategy.setByAccessoryId(accessoryId, result);
    }

    return result;
  }
}
