import type { PrismaClient } from '@prisma/client';

import type {
  EffectKeywordGroup,
  IEffectKeywordRepository,
} from '@/domain/repositories/IEffectKeywordRepository';

export class EffectKeywordRepository implements IEffectKeywordRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async getSkillEffectKeywords(): Promise<EffectKeywordGroup[]> {
    const [rows, definitions] = await Promise.all([
      this.prisma.skillEffectKeyword.findMany({
        orderBy: [{ effectType: 'asc' }, { displayOrder: 'asc' }],
      }),
      this.prisma.skillEffectDefinition.findMany({
        orderBy: { displayOrder: 'asc' },
      }),
    ]);
    return this.groupByEffectType(rows, definitions);
  }

  async getTraitEffectKeywords(): Promise<EffectKeywordGroup[]> {
    const [rows, definitions] = await Promise.all([
      this.prisma.traitEffectKeyword.findMany({
        orderBy: [{ effectType: 'asc' }, { displayOrder: 'asc' }],
      }),
      this.prisma.traitEffectDefinition.findMany({
        orderBy: { displayOrder: 'asc' },
      }),
    ]);
    return this.groupByEffectType(rows, definitions);
  }

  private groupByEffectType(
    rows: { effectType: string; keyword: string }[],
    definitions: { effectType: string; label: string; description: string }[]
  ): EffectKeywordGroup[] {
    const keywordsMap = new Map<string, string[]>();
    for (const row of rows) {
      const list = keywordsMap.get(row.effectType) ?? [];
      list.push(row.keyword);
      keywordsMap.set(row.effectType, list);
    }
    return definitions.map(({ effectType, label, description }) => ({
      effectType,
      label,
      description,
      keywords: keywordsMap.get(effectType) ?? [],
    }));
  }
}
