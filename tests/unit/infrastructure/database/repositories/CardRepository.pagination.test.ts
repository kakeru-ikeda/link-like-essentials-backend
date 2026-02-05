import type { PrismaClient } from '@prisma/client';

import type { PaginationResult } from '@/domain/repositories/ICardRepository';
import { CardRepository } from '@/infrastructure/database/repositories/CardRepository';

describe('CardRepository - Pagination', () => {
  let repository: CardRepository;
  let mockPrisma: jest.Mocked<PrismaClient>;

  beforeEach(() => {
    mockPrisma = {
      card: {
        findMany: jest.fn() as never,
        count: jest.fn() as never,
      },
    } as never;

    repository = new CardRepository(mockPrisma);
  });

  describe('findAllPaginated', () => {
    const mockCards = [
      {
        id: 1,
        cardName: 'カード1',
        characterName: 'キャラ1',
        rarity: 'UR',
        limited: '恒常',
        styleType: 'チアリーダー',
        cardUrl: 'http://example.com/1',
        releaseDate: new Date('2024-01-01'),
        isLocked: false,
        createdAt: new Date(),
        updatedAt: new Date(),
        detail: null,
        accessories: [],
      },
      {
        id: 2,
        cardName: 'カード2',
        characterName: 'キャラ2',
        rarity: 'SR',
        limited: '期間限定',
        styleType: 'トリックスター',
        cardUrl: 'http://example.com/2',
        releaseDate: new Date('2024-01-02'),
        isLocked: false,
        createdAt: new Date(),
        updatedAt: new Date(),
        detail: null,
        accessories: [],
      },
    ];

    it('最初のページを正しく取得できる', async () => {
      (mockPrisma.card.count as jest.Mock).mockResolvedValue(10);
      (mockPrisma.card.findMany as jest.Mock).mockResolvedValue([
        ...mockCards,
        { ...mockCards[0], id: 3 }, // hasNextPage判定用
      ]);

      const result: PaginationResult = await repository.findAllPaginated(
        undefined,
        2
      );

      expect(result.cards).toHaveLength(2);
      expect(result.totalCount).toBe(10);
      expect(result.hasNextPage).toBe(true);
      expect(mockPrisma.card.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          take: 3, // first + 1
        })
      );
    });

    it('cursorを使用して次のページを取得できる', async () => {
      const cursor = Buffer.from(
        JSON.stringify({ id: 2, releaseDate: '2024-01-02T00:00:00.000Z' })
      ).toString('base64');

      (mockPrisma.card.count as jest.Mock).mockResolvedValue(10);
      (mockPrisma.card.findMany as jest.Mock).mockResolvedValue([mockCards[0]!]);

      const result: PaginationResult = await repository.findAllPaginated(
        undefined,
        2,
        cursor
      );

      expect(result.cards).toHaveLength(1);
      expect(result.hasNextPage).toBe(false);
      expect(mockPrisma.card.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          cursor: { id: 2 },
          skip: 1,
        })
      );
    });

    it('フィルター条件を適用できる', async () => {
      (mockPrisma.card.count as jest.Mock).mockResolvedValue(1);
      (mockPrisma.card.findMany as jest.Mock).mockResolvedValue([mockCards[0]!]);

      const result: PaginationResult = await repository.findAllPaginated(
        { rarity: 'UR' },
        2
      );

      expect(result.cards).toHaveLength(1);
      expect(mockPrisma.card.count).toHaveBeenCalledWith({
        where: { rarity: 'UR' },
      });
    });

    it('デフォルトでfirst=20を使用する', async () => {
      (mockPrisma.card.count as jest.Mock).mockResolvedValue(5);
      (mockPrisma.card.findMany as jest.Mock).mockResolvedValue(mockCards);

      await repository.findAllPaginated();

      expect(mockPrisma.card.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          take: 21, // 20 + 1
        })
      );
    });

    it('最後のページでhasNextPageがfalseになる', async () => {
      (mockPrisma.card.count as jest.Mock).mockResolvedValue(2);
      (mockPrisma.card.findMany as jest.Mock).mockResolvedValue(mockCards);

      const result: PaginationResult = await repository.findAllPaginated(
        undefined,
        5
      );

      expect(result.hasNextPage).toBe(false);
    });
  });
});
