import type { PrismaClient } from '@prisma/client';

export interface EffectKeywordGroup {
  effectType: string;
  label: string;
  description: string;
  keywords: string[];
}

export class EffectKeywordRepository {
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
    return Array.from(map.entries()).map(([effectType, keywords]) => ({
      effectType,
      label: defMap.get(effectType)?.label ?? '',
      description: defMap.get(effectType)?.description ?? '',
      keywords,
    }));
  }
}
