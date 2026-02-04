import type { Prisma, PrismaClient } from '@prisma/client';

import type { UnDrawAnalysis } from '@/domain/entities/TraitAnalysis';
import type { IUnDrawAnalysisRepository } from '@/domain/repositories/ITraitAnalysisRepository';

export class UnDrawAnalysisRepository implements IUnDrawAnalysisRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async findByCardId(cardId: number): Promise<UnDrawAnalysis | null> {
    const client = this.prisma as PrismaTraitAnalysisClient;
    const result = await client.unDrawAnalysis.findUnique({
      where: { cardId },
    });

    return result ? this.mapToEntity(result) : null;
  }

  async findByAccessoryId(accessoryId: number): Promise<UnDrawAnalysis | null> {
    const client = this.prisma as PrismaTraitAnalysisClient;
    const result = await client.unDrawAnalysis.findUnique({
      where: { accessoryId },
    });

    return result ? this.mapToEntity(result) : null;
  }

  private mapToEntity(analysis: UnDrawAnalysisRecord): UnDrawAnalysis {
    return {
      id: analysis.id,
      cardId: analysis.cardId,
      accessoryId: analysis.accessoryId,
      section1: analysis.section1,
      section2: analysis.section2,
      section3: analysis.section3,
      section4: analysis.section4,
      section5: analysis.section5,
      sectionFever: analysis.sectionFever,
      conditionDetail: this.mapJson(analysis.conditionDetail),
      analyzedAt: analysis.analyzedAt,
    };
  }

  private mapJson(
    value: Prisma.JsonValue | null
  ): Record<string, unknown> | null {
    if (!value || typeof value !== 'object' || Array.isArray(value)) {
      return null;
    }

    return value as Record<string, unknown>;
  }
}

type UnDrawAnalysisRecord = {
  id: number;
  cardId: number | null;
  accessoryId: number | null;
  section1: boolean;
  section2: boolean;
  section3: boolean;
  section4: boolean;
  section5: boolean;
  sectionFever: boolean;
  conditionDetail: Prisma.JsonValue | null;
  analyzedAt: Date | null;
};

type PrismaTraitAnalysisClient = PrismaClient & {
  unDrawAnalysis: {
    findUnique: (args: {
      where: { cardId?: number; accessoryId?: number };
    }) => Promise<UnDrawAnalysisRecord | null>;
  };
};
