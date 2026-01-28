import type {
  PrismaClient,
  GradeChallenge as PrismaGradeChallenge,
} from '@prisma/client';

import type { GradeChallenge } from '@/domain/entities/GradeChallenge';
import type {
  GradeChallengeFilterInput,
  GradeChallengeStats,
  IGradeChallengeRepository,
} from '@/domain/repositories/IGradeChallengeRepository';

export class GradeChallengeRepository implements IGradeChallengeRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async findById(id: number): Promise<GradeChallenge | null> {
    const gradeChallenge = await this.prisma.gradeChallenge.findUnique({
      where: { id },
      include: {
        details: {
          include: {
            song: {
              include: {
                moodProgressions: {
                  orderBy: {
                    sectionOrder: 'asc',
                  },
                },
              },
            },
            sectionEffects: {
              orderBy: {
                sectionOrder: 'asc',
              },
            },
          },
          orderBy: {
            stageName: 'asc',
          },
        },
      },
    });

    return gradeChallenge ? this.mapToEntity(gradeChallenge) : null;
  }

  async findByTitle(title: string): Promise<GradeChallenge | null> {
    const gradeChallenge = await this.prisma.gradeChallenge.findFirst({
      where: {
        title,
      },
      include: {
        details: {
          include: {
            song: {
              include: {
                moodProgressions: {
                  orderBy: {
                    sectionOrder: 'asc',
                  },
                },
              },
            },
            sectionEffects: {
              orderBy: {
                sectionOrder: 'asc',
              },
            },
          },
          orderBy: {
            stageName: 'asc',
          },
        },
      },
    });

    return gradeChallenge ? this.mapToEntity(gradeChallenge) : null;
  }

  async findAll(filter?: GradeChallengeFilterInput): Promise<GradeChallenge[]> {
    const where = this.buildWhereClause(filter);

    const gradeChallenges = await this.prisma.gradeChallenge.findMany({
      where,
      include: {
        details: {
          include: {
            song: {
              include: {
                moodProgressions: {
                  orderBy: {
                    sectionOrder: 'asc',
                  },
                },
              },
            },
            sectionEffects: {
              orderBy: {
                sectionOrder: 'asc',
              },
            },
          },
          orderBy: {
            stageName: 'asc',
          },
        },
      },
      orderBy: [
        {
          startDate: 'desc',
        },
        {
          id: 'desc',
        },
      ],
    });

    return gradeChallenges.map((gc) => this.mapToEntity(gc));
  }

  async findOngoing(): Promise<GradeChallenge[]> {
    const now = new Date();

    const gradeChallenges = await this.prisma.gradeChallenge.findMany({
      where: {
        startDate: {
          lte: now,
        },
        endDate: {
          gte: now,
        },
      },
      include: {
        details: {
          include: {
            song: {
              include: {
                moodProgressions: {
                  orderBy: {
                    sectionOrder: 'asc',
                  },
                },
              },
            },
            sectionEffects: {
              orderBy: {
                sectionOrder: 'asc',
              },
            },
          },
          orderBy: {
            stageName: 'asc',
          },
        },
      },
      orderBy: [
        {
          startDate: 'desc',
        },
        {
          id: 'desc',
        },
      ],
    });

    return gradeChallenges.map((gc) => this.mapToEntity(gc));
  }

  async getStats(): Promise<GradeChallengeStats> {
    const [totalEvents, byTermName] = await Promise.all([
      this.prisma.gradeChallenge.count(),
      this.prisma.gradeChallenge.groupBy({
        by: ['termName'],
        _count: true,
        orderBy: {
          termName: 'desc',
        },
      }),
    ]);

    return {
      totalEvents,
      byTermName: byTermName.map((term) => ({
        termName: term.termName ?? 'Unknown',
        count: term._count,
      })),
    };
  }

  private buildWhereClause(
    filter?: GradeChallengeFilterInput
  ): Record<string, unknown> {
    if (!filter) return {};

    type WhereCondition = {
      termName?: string;
      title?: { contains: string; mode: string };
      startDate?: { gte?: Date; lte?: Date };
      details?: {
        some: {
          song?: {
            category?: string;
          };
        };
      };
    };

    const conditions: WhereCondition = {
      ...(filter.termName && { termName: filter.termName }),
      ...(filter.title && {
        title: { contains: filter.title, mode: 'insensitive' },
      }),
    };

    if (filter.startDateFrom || filter.startDateTo) {
      conditions.startDate = {
        ...(filter.startDateFrom && { gte: filter.startDateFrom }),
        ...(filter.startDateTo && { lte: filter.startDateTo }),
      };
    }

    if (filter.hasSongWithDeckType) {
      conditions.details = {
        some: {
          song: {
            category: filter.hasSongWithDeckType,
          },
        },
      };
    }

    return conditions;
  }

  private mapToEntity(
    gradeChallenge: PrismaGradeChallenge & { details?: unknown[] }
  ): GradeChallenge {
    return {
      id: gradeChallenge.id,
      title: gradeChallenge.title,
      startDate: gradeChallenge.startDate,
      endDate: gradeChallenge.endDate,
      detailUrl: gradeChallenge.detailUrl,
      termName: gradeChallenge.termName,
      isLocked: gradeChallenge.isLocked,
      createdAt: gradeChallenge.createdAt,
      updatedAt: gradeChallenge.updatedAt,
      details: gradeChallenge.details as GradeChallenge['details'],
    };
  }
}
