export interface EffectKeywordGroup {
  effectType: string;
  label: string;
  description: string;
  keywords: string[];
}

export interface IEffectKeywordRepository {
  getSkillEffectKeywords(): Promise<EffectKeywordGroup[]>;
  getTraitEffectKeywords(): Promise<EffectKeywordGroup[]>;
}
