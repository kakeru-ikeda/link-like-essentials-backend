import type { CardDetail } from '@/domain/entities/CardDetail';
import { EnumMapper } from '@/infrastructure/mappers/EnumMapper';
import { requireAuth } from '@/presentation/middleware/authGuard';

import type { GraphQLContext } from '../context';

interface QueryResolvers {
  cardDetail: (
    parent: unknown,
    args: { cardId: string },
    context: GraphQLContext
  ) => Promise<unknown>;
  cardDetails: (
    parent: unknown,
    args: { cardIds: string[] },
    context: GraphQLContext
  ) => Promise<unknown>;
}

export interface CardDetailResolvers {
  stats: (
    parent: CardDetail,
    args: Record<string, never>,
    context: GraphQLContext
  ) => unknown;
  specialAppeal: (
    parent: CardDetail,
    args: Record<string, never>,
    context: GraphQLContext
  ) => unknown;
  skill: (
    parent: CardDetail,
    args: Record<string, never>,
    context: GraphQLContext
  ) => unknown;
  trait: (
    parent: CardDetail,
    args: Record<string, never>,
    context: GraphQLContext
  ) => unknown;
  accessories: (
    parent: CardDetail,
    args: Record<string, never>,
    context: GraphQLContext
  ) => Promise<unknown>;
  favoriteMode: (parent: CardDetail) => string | null;
  card: (
    parent: CardDetail,
    args: Record<string, never>,
    context: GraphQLContext
  ) => Promise<unknown>;
}

export const cardDetailResolvers: {
  Query: QueryResolvers;
  CardDetail: CardDetailResolvers;
} = {
  Query: {
    cardDetail: async (_, { cardId }, context) => {
      requireAuth(context);

      return await context.dataSources.cardDetailService.findByCardId(
        parseInt(cardId, 10)
      );
    },

    cardDetails: async (_, { cardIds }, context) => {
      requireAuth(context);

      const parsedIds = cardIds.map((id) => parseInt(id, 10));
      return await context.dataSources.cardDetailService.findByCardIds(
        parsedIds
      );
    },
  },

  CardDetail: {
    stats: (parent, _, context) => {
      return context.dataSources.cardDetailService.buildStats(parent);
    },

    specialAppeal: (parent, _, context) => {
      return context.dataSources.cardDetailService.buildSpecialAppeal(parent);
    },

    skill: (parent, _, context) => {
      return context.dataSources.cardDetailService.buildSkill(parent);
    },

    trait: (parent, _, context) => {
      return context.dataSources.cardDetailService.buildTrait(parent);
    },

    accessories: async (parent, _, context) => {
      // 事前ロード済みの場合はそれを返す
      if (parent.accessories) return parent.accessories;

      // フィールドリゾルバーでのフォールバック（通常は使われない）
      return await context.dataSources.accessoryService.findByCardId(
        parent.cardId
      );
    },

    favoriteMode: (parent) => {
      return EnumMapper.toFavoriteModeEnum(parent.favoriteMode);
    },

    card: async (parent, _, context) => {
      if (parent.card) return parent.card;
      return await context.dataSources.cardService.findById(parent.cardId);
    },
  },
};
