import type { PrismaClient } from '@prisma/client';

import type { LiveGrandPrixFilterInput } from '@/domain/repositories/ILiveGrandPrixRepository';
import { LiveGrandPrixRepository } from '@/infrastructure/database/repositories/LiveGrandPrixRepository';

describe('LiveGrandPrixRepository', () => {
  let repository: LiveGrandPrixRepository;
  let mockPrisma: jest.Mocked<PrismaClient>;

  beforeEach(() => {
    mockPrisma = {
      liveGrandPrix: {
        findUnique: jest.fn(),
        findFirst: jest.fn(),
        findMany: jest.fn(),
        count: jest.fn(),
        groupBy: jest.fn(),
      },
    } as never;

    repository = new LiveGrandPrixRepository(mockPrisma);
  });

  describe('findAll with hasSongWithDeckType filter', () => {
    const mockLiveGrandPrixList = [
      {
        id: 1,
        startDate: new Date('2024-06-11T12:00:00.000Z'),
        endDate: new Date('2024-06-17T03:59:00.000Z'),
        eventName: '105期 1stTerm 第1回個人戦',
        eventUrl: 'https://example.com/event1',
        yearTerm: '105期',
        isLocked: false,
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-01'),
        details: [
          {
            id: 1,
            liveGrandPrixId: 1,
            stageName: 'A',
            specialEffect: 'テスト効果',
            songId: 50,
            isLocked: false,
            createdAt: new Date('2024-01-01'),
            updatedAt: new Date('2024-01-01'),
            song: {
              id: 50,
              songName: 'テスト曲A',
              category: '105期',
              unit: 'テストユニット',
              isLocked: false,
              createdAt: new Date('2024-01-01'),
              updatedAt: new Date('2024-01-01'),
              moodProgressions: [],
            },
            sectionEffects: [],
          },
          {
            id: 2,
            liveGrandPrixId: 1,
            stageName: 'B',
            specialEffect: 'テスト効果2',
            songId: 31,
            isLocked: false,
            createdAt: new Date('2024-01-01'),
            updatedAt: new Date('2024-01-01'),
            song: {
              id: 31,
              songName: 'テスト曲B',
              category: '104期',
              unit: 'テストユニット',
              isLocked: false,
              createdAt: new Date('2024-01-01'),
              updatedAt: new Date('2024-01-01'),
              moodProgressions: [],
            },
            sectionEffects: [],
          },
        ],
      },
      {
        id: 2,
        startDate: new Date('2024-06-18T12:00:00.000Z'),
        endDate: new Date('2024-06-24T03:59:00.000Z'),
        eventName: '105期 1stTerm 第2回個人戦',
        eventUrl: 'https://example.com/event2',
        yearTerm: '105期',
        isLocked: false,
        createdAt: new Date('2024-01-02'),
        updatedAt: new Date('2024-01-02'),
        details: [
          {
            id: 3,
            liveGrandPrixId: 2,
            stageName: 'A',
            specialEffect: 'テスト効果3',
            songId: 51,
            isLocked: false,
            createdAt: new Date('2024-01-02'),
            updatedAt: new Date('2024-01-02'),
            song: {
              id: 51,
              songName: 'テスト曲C',
              category: '105期',
              unit: 'テストユニット2',
              isLocked: false,
              createdAt: new Date('2024-01-02'),
              updatedAt: new Date('2024-01-02'),
              moodProgressions: [],
            },
            sectionEffects: [],
          },
        ],
      },
    ];

    it('should filter LiveGrandPrix that has songs with specified deck type (105期)', async () => {
      const filter: LiveGrandPrixFilterInput = {
        hasSongWithDeckType: '105期',
      };

      (mockPrisma.liveGrandPrix.findMany as jest.Mock).mockResolvedValue(
        mockLiveGrandPrixList
      );

      const result = await repository.findAll(filter);

      expect(mockPrisma.liveGrandPrix.findMany).toHaveBeenCalledWith({
        where: {
          details: {
            some: {
              song: {
                category: '105期',
              },
            },
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

      expect(result).toHaveLength(2);
      expect(result[0]?.id).toBe(1);
      expect(result[1]?.id).toBe(2);
    });

    it('should filter LiveGrandPrix that has songs with specified deck type (104期)', async () => {
      const filter: LiveGrandPrixFilterInput = {
        hasSongWithDeckType: '104期',
      };

      // 104期の曲を持つのは1件目のみ
      (mockPrisma.liveGrandPrix.findMany as jest.Mock).mockResolvedValue([
        mockLiveGrandPrixList[0],
      ]);

      const result = await repository.findAll(filter);

      expect(mockPrisma.liveGrandPrix.findMany).toHaveBeenCalledWith({
        where: {
          details: {
            some: {
              song: {
                category: '104期',
              },
            },
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

      expect(result).toHaveLength(1);
      expect(result[0]?.id).toBe(1);
      expect(result[0]?.yearTerm).toBe('105期');
    });

    it('should combine hasSongWithDeckType with other filters', async () => {
      const filter: LiveGrandPrixFilterInput = {
        yearTerm: '105期',
        hasSongWithDeckType: '104期',
      };

      (mockPrisma.liveGrandPrix.findMany as jest.Mock).mockResolvedValue([
        mockLiveGrandPrixList[0],
      ]);

      const result = await repository.findAll(filter);

      expect(mockPrisma.liveGrandPrix.findMany).toHaveBeenCalledWith({
        where: {
          yearTerm: '105期',
          details: {
            some: {
              song: {
                category: '104期',
              },
            },
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

      expect(result).toHaveLength(1);
      expect(result[0]?.yearTerm).toBe('105期');
    });

    it('should return all LiveGrandPrix when hasSongWithDeckType is not specified', async () => {
      (mockPrisma.liveGrandPrix.findMany as jest.Mock).mockResolvedValue(
        mockLiveGrandPrixList
      );

      const result = await repository.findAll();

      expect(mockPrisma.liveGrandPrix.findMany).toHaveBeenCalledWith({
        where: {},
        include: expect.any(Object),
        orderBy: expect.any(Array),
      });

      expect(result).toHaveLength(2);
    });
  });
});
