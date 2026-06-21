import type { PrismaClient } from '@prisma/client';

import { CardRepository } from '@/infrastructure/database/repositories/CardRepository';

describe('CardRepository - Filter', () => {
  let repository: CardRepository;
  let mockPrisma: jest.Mocked<PrismaClient>;

  const mockCard = {
    id: 1,
    cardName: 'テストカード',
    characterName: 'テストキャラ',
    rarity: 'UR',
    limited: '恒常',
    styleType: 'チアリーダー',
    cardUrl: null,
    releaseDate: new Date('2024-06-01'),
    isLocked: false,
    createdAt: new Date(),
    updatedAt: new Date(),
    detail: null,
    accessories: [],
    heartCollectAnalysis: null,
    unDrawAnalysis: null,
  };

  beforeEach(() => {
    mockPrisma = {
      card: {
        findMany: jest.fn() as never,
      },
    } as never;

    repository = new CardRepository(mockPrisma);
  });

  describe('findAll with releaseDate filters', () => {
    it('releaseDateFromのみ指定した場合、gteのみが設定されること', async () => {
      (mockPrisma.card.findMany as jest.Mock).mockResolvedValue([mockCard]);

      const releaseDateFrom = new Date('2024-06-01');
      await repository.findAll({ releaseDateFrom });

      expect(mockPrisma.card.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {
            releaseDate: {
              gte: releaseDateFrom,
            },
          },
        })
      );
    });

    it('releaseDateToのみ指定した場合、lteのみが設定されること', async () => {
      (mockPrisma.card.findMany as jest.Mock).mockResolvedValue([mockCard]);

      const releaseDateTo = new Date('2024-12-31');
      await repository.findAll({ releaseDateTo });

      expect(mockPrisma.card.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {
            releaseDate: {
              lte: releaseDateTo,
            },
          },
        })
      );
    });

    it('releaseDateFromとreleaseDateToの両方を指定した場合、gteとlteの両方が設定されること', async () => {
      (mockPrisma.card.findMany as jest.Mock).mockResolvedValue([mockCard]);

      const releaseDateFrom = new Date('2024-01-01');
      const releaseDateTo = new Date('2024-12-31');
      await repository.findAll({ releaseDateFrom, releaseDateTo });

      expect(mockPrisma.card.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {
            releaseDate: {
              gte: releaseDateFrom,
              lte: releaseDateTo,
            },
          },
        })
      );
    });

    it('日付フィルターを指定しない場合、where.releaseDateがundefinedであること', async () => {
      (mockPrisma.card.findMany as jest.Mock).mockResolvedValue([mockCard]);

      await repository.findAll({});

      expect(mockPrisma.card.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {},
        })
      );

      const lastCall = (mockPrisma.card.findMany as jest.Mock).mock.calls[0][0];
      expect(lastCall.where.releaseDate).toBeUndefined();
    });

    it('既存のフィルター（characterNameなど）と組み合わせた場合、両方の条件が設定されること', async () => {
      (mockPrisma.card.findMany as jest.Mock).mockResolvedValue([mockCard]);

      const releaseDateFrom = new Date('2024-01-01');
      const releaseDateTo = new Date('2024-12-31');
      await repository.findAll({
        characterName: 'テストキャラ',
        releaseDateFrom,
        releaseDateTo,
      });

      expect(mockPrisma.card.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {
            characterName: {
              contains: 'テストキャラ',
              mode: 'insensitive',
            },
            releaseDate: {
              gte: releaseDateFrom,
              lte: releaseDateTo,
            },
          },
        })
      );
    });
  });
});
