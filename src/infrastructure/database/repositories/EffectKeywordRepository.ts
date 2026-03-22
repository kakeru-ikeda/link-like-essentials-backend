import type { PrismaClient } from '@prisma/client';

export interface EffectKeywordGroup {
  effectType: string;
  keywords: string[];
}

export class EffectKeywordRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async getSkillEffectKeywords(): Promise<EffectKeywordGroup[]> {
    const rows = await this.prisma.skillEffectKeyword.findMany({
      orderBy: [{ effectType: 'asc' }, { displayOrder: 'asc' }],
    });
    return this.groupByEffectType(rows);
  }

  async getTraitEffectKeywords(): Promise<EffectKeywordGroup[]> {
    const rows = await this.prisma.traitEffectKeyword.findMany({
      orderBy: [{ effectType: 'asc' }, { displayOrder: 'asc' }],
    });
    return this.groupByEffectType(rows);
  }

  private groupByEffectType(
    rows: { effectType: string; keyword: string }[]
  ): EffectKeywordGroup[] {
    const map = new Map<string, string[]>();
    for (const row of rows) {
      const list = map.get(row.effectType) ?? [];
      list.push(row.keyword);
      map.set(row.effectType, list);
    }
    return Array.from(map.entries()).map(([effectType, keywords]) => ({
      effectType,
      keywords,
    }));
  }
}
