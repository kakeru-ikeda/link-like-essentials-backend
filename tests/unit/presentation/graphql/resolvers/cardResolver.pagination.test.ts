import type { GraphQLResolveInfo } from 'graphql';

import type { CardConnection } from '@/application/dto/PaginationDTO';
import { cardResolvers } from '@/presentation/graphql/resolvers/cardResolver';
import type { GraphQLContext } from '@/presentation/graphql/context';

jest.mock('@/presentation/middleware/authGuard', () => ({
  requireAuth: jest.fn(),
}));

describe('cardResolver - Pagination', () => {
  let mockContext: GraphQLContext;

  beforeEach(() => {
    mockContext = {
      dataSources: {
        cardService: {
          findAllPaginated: jest.fn(),
        },
      },
    } as unknown as GraphQLContext;
  });

  describe('Query.cardsConnection', () => {
    const mockInfo = {
      fieldNodes: [{ selectionSet: { selections: [] } }],
    } as unknown as GraphQLResolveInfo;

    it('ページネーション結果を正しく返す', async () => {
      const mockConnection: CardConnection = {
        edges: [
          {
            node: {
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
            cursor: 'cursor1',
          },
        ],
        pageInfo: {
          hasNextPage: true,
          hasPreviousPage: false,
          startCursor: 'cursor1',
          endCursor: 'cursor1',
        },
        totalCount: 10,
      };

      (
        mockContext.dataSources.cardService.findAllPaginated as jest.Mock
      ).mockResolvedValue(mockConnection);

      const result = await cardResolvers.Query.cardsConnection(
        {},
        { first: 2 },
        mockContext,
        mockInfo
      );

      expect(result).toEqual(mockConnection);
      expect(
        mockContext.dataSources.cardService.findAllPaginated
      ).toHaveBeenCalledWith(
        undefined,
        { first: 2, after: undefined },
        { heartCollectAnalysis: false, unDrawAnalysis: false }
      );
    });

    it('フィルター条件を渡せる', async () => {
      const mockConnection: CardConnection = {
        edges: [],
        pageInfo: {
          hasNextPage: false,
          hasPreviousPage: false,
          startCursor: null,
          endCursor: null,
        },
        totalCount: 0,
      };

      (
        mockContext.dataSources.cardService.findAllPaginated as jest.Mock
      ).mockResolvedValue(mockConnection);

      await cardResolvers.Query.cardsConnection(
        {},
        { filter: { rarity: 'UR' }, first: 5, after: 'cursor123' },
        mockContext,
        mockInfo
      );

      expect(
        mockContext.dataSources.cardService.findAllPaginated
      ).toHaveBeenCalledWith(
        { rarity: 'UR' },
        { first: 5, after: 'cursor123' },
        { heartCollectAnalysis: false, unDrawAnalysis: false }
      );
    });

    it('引数なしでも動作する', async () => {
      const mockConnection: CardConnection = {
        edges: [],
        pageInfo: {
          hasNextPage: false,
          hasPreviousPage: false,
          startCursor: null,
          endCursor: null,
        },
        totalCount: 0,
      };

      (
        mockContext.dataSources.cardService.findAllPaginated as jest.Mock
      ).mockResolvedValue(mockConnection);

      await cardResolvers.Query.cardsConnection({}, {}, mockContext, mockInfo);

      expect(
        mockContext.dataSources.cardService.findAllPaginated
      ).toHaveBeenCalledWith(
        undefined,
        { first: undefined, after: undefined },
        { heartCollectAnalysis: false, unDrawAnalysis: false }
      );
    });
  });
});
