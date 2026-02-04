import type { Prisma, PrismaClient } from '@prisma/client';

import type { HeartCollectAnalysis } from '@/domain/entities/TraitAnalysis';
import type { IHeartCollectAnalysisRepository } from '@/domain/repositories/ITraitAnalysisRepository';

export class HeartCollectAnalysisRepository
  implements IHeartCollectAnalysisRepository
{
  constructor(private readonly prisma: PrismaClient) {}

  async findByCardId(cardId: number): Promise<HeartCollectAnalysis | null> {
    const client = this.prisma as PrismaTraitAnalysisClient;
    const result = await client.heartCollectAnalysis.findUnique({
      where: { cardId },
    });

    return result ? this.mapToEntity(result) : null;
  }

  async findByAccessoryId(
    accessoryId: number
  ): Promise<HeartCollectAnalysis | null> {
    const client = this.prisma as PrismaTraitAnalysisClient;
    const result = await client.heartCollectAnalysis.findUnique({
      where: { accessoryId },
    });

    return result ? this.mapToEntity(result) : null;
  }

  private mapToEntity(
    analysis: HeartCollectAnalysisRecord
  ): HeartCollectAnalysis {
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

type HeartCollectAnalysisRecord = {
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
  heartCollectAnalysis: {
    findUnique: (args: {
      where: { cardId?: number; accessoryId?: number };
    }) => Promise<HeartCollectAnalysisRecord | null>;
  };
};
