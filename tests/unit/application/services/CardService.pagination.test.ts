import type { Card } from '@/domain/entities/Card';
import type { CardConnection } from '@/application/dto/PaginationDTO';
import { CardService } from '@/application/services/CardService';
import type { ICardRepository } from '@/domain/repositories/ICardRepository';
import type { CardCacheStrategy } from '@/infrastructure/cache/strategies/CardCacheStrategy';

describe('CardService - Pagination', () => {
  let cardService: CardService;
  let mockRepository: jest.Mocked<ICardRepository>;
  let mockCacheStrategy: jest.Mocked<CardCacheStrategy>;

  beforeEach(() => {
    mockRepository = {
      findAllPaginated: jest.fn(),
    } as unknown as jest.Mocked<ICardRepository>;

    mockCacheStrategy = {
      getCardList: jest.fn(),
      setCardList: jest.fn(),
    } as unknown as jest.Mocked<CardCacheStrategy>;

    cardService = new CardService(mockRepository, mockCacheStrategy);
  });

  describe('findAllPaginated', () => {
    const mockCards: Card[] = [
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
      },
    ];

    it('ページネーション結果を正しく返す', async () => {
      mockCacheStrategy.getCardList.mockResolvedValue(null);
      mockRepository.findAllPaginated.mockResolvedValue({
        cards: mockCards,
        totalCount: 10,
        hasNextPage: true,
      });

      const result: CardConnection = await cardService.findAllPaginated(
        undefined,
        { first: 2 }
      );

      expect(result.edges).toHaveLength(2);
      expect(result.totalCount).toBe(10);
      expect(result.pageInfo.hasNextPage).toBe(true);
      expect(result.pageInfo.hasPreviousPage).toBe(false);
      expect(result.edges[0]?.node.id).toBe(1);
      expect(result.edges[0]?.cursor).toBeDefined();
    });

    it('after指定時にhasPreviousPageがtrueになる', async () => {
      const cursor = Buffer.from(
        JSON.stringify({ id: 2, releaseDate: '2024-01-02T00:00:00.000Z' })
      ).toString('base64');

      mockCacheStrategy.getCardList.mockResolvedValue(null);
      mockRepository.findAllPaginated.mockResolvedValue({
        cards: [mockCards[0]!],
        totalCount: 10,
        hasNextPage: false,
      });

      const result: CardConnection = await cardService.findAllPaginated(
        undefined,
        { first: 2, after: cursor }
      );

      expect(result.pageInfo.hasPreviousPage).toBe(true);
      expect(result.pageInfo.hasNextPage).toBe(false);
    });

    it('キャッシュがある場合はキャッシュから返す', async () => {
      const cachedConnection: CardConnection = {
        edges: mockCards.map((card) => ({
          node: card,
          cursor: Buffer.from(
            JSON.stringify({ id: card.id, releaseDate: card.releaseDate })
          ).toString('base64'),
        })),
        pageInfo: {
          hasNextPage: true,
          hasPreviousPage: false,
          startCursor: 'cursor1',
          endCursor: 'cursor2',
        },
        totalCount: 10,
      };

      mockCacheStrategy.getCardList.mockResolvedValue(cachedConnection);

      const result = await cardService.findAllPaginated(undefined, {
        first: 2,
      });

      expect(result).toEqual(cachedConnection);
      expect(mockRepository.findAllPaginated).not.toHaveBeenCalled();
    });

    it('キャッシュがない場合はDBから取得してキャッシュする', async () => {
      mockCacheStrategy.getCardList.mockResolvedValue(null);
      mockRepository.findAllPaginated.mockResolvedValue({
        cards: mockCards,
        totalCount: 10,
        hasNextPage: true,
      });

      await cardService.findAllPaginated(undefined, { first: 2 });

      expect(mockRepository.findAllPaginated).toHaveBeenCalledWith(
        undefined,
        2,
        undefined,
        undefined
      );
      expect(mockCacheStrategy.setCardList).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          edges: expect.any(Array),
          pageInfo: expect.any(Object),
          totalCount: 10,
        })
      );
    });

    it('デフォルトでfirst=20を使用する', async () => {
      mockCacheStrategy.getCardList.mockResolvedValue(null);
      mockRepository.findAllPaginated.mockResolvedValue({
        cards: [],
        totalCount: 0,
        hasNextPage: false,
      });

      await cardService.findAllPaginated();

      expect(mockRepository.findAllPaginated).toHaveBeenCalledWith(
        undefined,
        20,
        undefined,
        undefined
      );
    });

    it('startCursorとendCursorが正しく設定される', async () => {
      mockCacheStrategy.getCardList.mockResolvedValue(null);
      mockRepository.findAllPaginated.mockResolvedValue({
        cards: mockCards,
        totalCount: 10,
        hasNextPage: false,
      });

      const result = await cardService.findAllPaginated(undefined, {
        first: 2,
      });

      expect(result.pageInfo.startCursor).toBeDefined();
      expect(result.pageInfo.endCursor).toBeDefined();
      expect(result.pageInfo.startCursor).not.toBe(result.pageInfo.endCursor);
    });

    it('空の結果の場合、cursorがnullになる', async () => {
      mockCacheStrategy.getCardList.mockResolvedValue(null);
      mockRepository.findAllPaginated.mockResolvedValue({
        cards: [],
        totalCount: 0,
        hasNextPage: false,
      });

      const result = await cardService.findAllPaginated(undefined, {
        first: 2,
      });

      expect(result.pageInfo.startCursor).toBeNull();
      expect(result.pageInfo.endCursor).toBeNull();
    });
  });
});
