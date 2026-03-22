import type { IEffectKeywordRepository } from '@/domain/repositories/IEffectKeywordRepository';

import type { EffectKeywordGroupDTO } from '../dto/EffectKeywordGroupDTO';

export class EffectKeywordService {
  constructor(
    private readonly effectKeywordRepository: IEffectKeywordRepository
  ) {}

  async getSkillEffectKeywords(): Promise<EffectKeywordGroupDTO[]> {
    return this.effectKeywordRepository.getSkillEffectKeywords();
  }

  async getTraitEffectKeywords(): Promise<EffectKeywordGroupDTO[]> {
    return this.effectKeywordRepository.getTraitEffectKeywords();
  }
}
