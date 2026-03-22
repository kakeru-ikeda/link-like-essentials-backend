import type { PrismaClient } from '@prisma/client';

import type { EffectKeywordGroup, IEffectKeywordRepository } from '@/domain/repositories/IEffectKeywordRepository';

export class EffectKeywordRepository implements IEffectKeywordRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async getSkillEffectKeywords(): Promise<EffectKeywordGroup[]> {
    const [rows, definitions] = await Promise.all([
      this.prisma.skillEffectKeyword.findMany({
        orderBy: [{ effectType: 'asc' }, { displayOrder: 'asc' }],
      }),
      this.prisma.skillEffectDefinition.findMany(),
    ]);
    const defMap = new Map(
      definitions.map((d) => [
        d.effectType,
        { label: d.label, description: d.description },
      ])
    );
    return this.groupByEffectType(rows, defMap);
  }

  async getTraitEffectKeywords(): Promise<EffectKeywordGroup[]> {
    const [rows, definitions] = await Promise.all([
      this.prisma.traitEffectKeyword.findMany({
        orderBy: [{ effectType: 'asc' }, { displayOrder: 'asc' }],
      }),
      this.prisma.traitEffectDefinition.findMany(),
    ]);
    const defMap = new Map(
      definitions.map((d) => [
        d.effectType,
        { label: d.label, description: d.description },
      ])
    );
    return this.groupByEffectType(rows, defMap);
  }

  private groupByEffectType(
    rows: { effectType: string; keyword: string }[],
    defMap: Map<string, { label: string; description: string }>
  ): EffectKeywordGroup[] {
    const map = new Map<string, string[]>();
    for (const row of rows) {
      const list = map.get(row.effectType) ?? [];
      list.push(row.keyword);
      map.set(row.effectType, list);
    }
    return Array.from(map.entries()).map(([effectType, keywords]) => {
      const definition = defMap.get(effectType);
      if (!definition) {
        throw new Error(
          `Missing effect definition for effectType "${effectType}" in EffectKeywordRepository.groupByEffectType`
        );
      }
      return {
        effectType,
        label: definition.label,
        description: definition.description,
        keywords,
      };
    });
  }
}
