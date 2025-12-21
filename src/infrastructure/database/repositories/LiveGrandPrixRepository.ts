import type {
  PrismaClient,
  LiveGrandPrix as PrismaLiveGrandPrix,
} from '@prisma/client';

import type { LiveGrandPrix } from '@/domain/entities/LiveGrandPrix';
import type {
  ILiveGrandPrixRepository,
  LiveGrandPrixFilterInput,
  LiveGrandPrixStats,
} from '@/domain/repositories/ILiveGrandPrixRepository';

export class LiveGrandPrixRepository implements ILiveGrandPrixRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async findById(id: number): Promise<LiveGrandPrix | null> {
    const liveGrandPrix = await this.prisma.liveGrandPrix.findUnique({
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

    return liveGrandPrix ? this.mapToEntity(liveGrandPrix) : null;
  }

  async findByEventName(eventName: string): Promise<LiveGrandPrix | null> {
    const liveGrandPrix = await this.prisma.liveGrandPrix.findFirst({
      where: {
        eventName,
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

    return liveGrandPrix ? this.mapToEntity(liveGrandPrix) : null;
  }

  async findAll(filter?: LiveGrandPrixFilterInput): Promise<LiveGrandPrix[]> {
    const where = this.buildWhereClause(filter);

    const liveGrandPrixList = await this.prisma.liveGrandPrix.findMany({
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

    return liveGrandPrixList.map((lgp) => this.mapToEntity(lgp));
  }

  async findByIds(ids: number[]): Promise<LiveGrandPrix[]> {
    const liveGrandPrixList = await this.prisma.liveGrandPrix.findMany({
      where: {
        id: { in: ids },
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

    return liveGrandPrixList.map((lgp) => this.mapToEntity(lgp));
  }

  async findOngoing(): Promise<LiveGrandPrix[]> {
    const now = new Date();

    const liveGrandPrixList = await this.prisma.liveGrandPrix.findMany({
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

    return liveGrandPrixList.map((lgp) => this.mapToEntity(lgp));
  }

  async getStats(): Promise<LiveGrandPrixStats> {
    const [totalEvents, byYearTerm] = await Promise.all([
      this.prisma.liveGrandPrix.count(),
      this.prisma.liveGrandPrix.groupBy({
        by: ['yearTerm'],
        _count: true,
        orderBy: {
          yearTerm: 'desc',
        },
      }),
    ]);

    return {
      totalEvents,
      byYearTerm: byYearTerm.map((yt) => ({
        yearTerm: yt.yearTerm,
        count: yt._count,
      })),
    };
  }

  private buildWhereClause(
    filter?: LiveGrandPrixFilterInput
  ): Record<string, unknown> {
    if (!filter) return {};

    type WhereCondition = {
      yearTerm?: string;
      eventName?: { contains: string; mode: string };
      startDate?: { gte?: Date; lte?: Date };
    };

    const conditions: WhereCondition = {
      ...(filter.yearTerm && { yearTerm: filter.yearTerm }),
      ...(filter.eventName && {
        eventName: { contains: filter.eventName, mode: 'insensitive' },
      }),
    };

    // 開催日フィルター
    if (filter.startDateFrom || filter.startDateTo) {
      conditions.startDate = {
        ...(filter.startDateFrom && { gte: filter.startDateFrom }),
        ...(filter.startDateTo && { lte: filter.startDateTo }),
      };
    }

    return conditions;
  }

  private mapToEntity(
    liveGrandPrix: PrismaLiveGrandPrix & { details?: unknown[] }
  ): LiveGrandPrix {
    return {
      id: liveGrandPrix.id,
      startDate: liveGrandPrix.startDate,
      endDate: liveGrandPrix.endDate,
      eventName: liveGrandPrix.eventName,
      eventUrl: liveGrandPrix.eventUrl,
      yearTerm: liveGrandPrix.yearTerm,
      isLocked: liveGrandPrix.isLocked,
      createdAt: liveGrandPrix.createdAt,
      updatedAt: liveGrandPrix.updatedAt,
      details: liveGrandPrix.details as LiveGrandPrix['details'],
    };
  }
}
