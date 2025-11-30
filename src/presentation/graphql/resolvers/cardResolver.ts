import type { CardFilterInput } from '@/application/dto/CardDTO';
import { EnumMapper } from '@/infrastructure/mappers/EnumMapper';
import { requireAuth } from '@/presentation/middleware/authGuard';

import type { GraphQLContext } from '../context';

interface QueryResolvers {
  cards: (
    parent: unknown,
    args: {
      filter?: CardFilterInput;
    },
    context: GraphQLContext
  ) => Promise<unknown>;
  card: (
    parent: unknown,
    args: { id: string },
    context: GraphQLContext
  ) => Promise<unknown>;
  cardByName: (
    parent: unknown,
    args: { cardName: string; characterName: string },
    context: GraphQLContext
  ) => Promise<unknown>;
  cardStats: (
    parent: unknown,
    args: Record<string, never>,
    context: GraphQLContext
  ) => Promise<unknown>;
}

export interface CardResolvers {
  detail: (
    parent: { id: number; detail?: unknown },
    args: Record<string, never>,
    context: GraphQLContext
  ) => Promise<unknown>;
  accessories: (
    parent: { id: number; accessories?: unknown[] },
    args: Record<string, never>,
    context: GraphQLContext
  ) => Promise<unknown>;
  rarity: (parent: { rarity: string | null }) => string | null;
  limited: (parent: { limited: string | null }) => string | null;
  styleType: (parent: { styleType: string | null }) => string | null;
}

export const cardResolvers: {
  Query: QueryResolvers;
  Card: CardResolvers;
} = {
  Query: {
    cards: async (_, args, context) => {
      requireAuth(context);

      const { filter } = args;

      const result = await context.dataSources.cardService.findAll(filter);

      return result;
    },

    card: async (_, { id }, context) => {
      requireAuth(context);

      return await context.dataSources.cardService.findById(parseInt(id, 10));
    },

    cardByName: async (_, { cardName, characterName }, context) => {
      requireAuth(context);

      return await context.dataSources.cardService.findByName(
        cardName,
        characterName
      );
    },

    cardStats: async (_, __, context) => {
      requireAuth(context);

      return await context.dataSources.cardService.getStats();
    },
  },

  Card: {
    detail: async (parent, _, context) => {
      if (parent.detail) return parent.detail;

      return await context.dataSources.cardDetailService.findByCardId(
        parent.id
      );
    },

    accessories: async (parent, _, context) => {
      // 事前ロード済みの場合はそれを返す
      if (parent.accessories) return parent.accessories;

      // フィールドリゾルバーでのフォールバック（通常は使われない）
      return await context.dataSources.accessoryService.findByCardId(parent.id);
    },

    rarity: (parent) => {
      return parent.rarity;
    },

    limited: (parent) => {
      return EnumMapper.toLimitedTypeEnum(parent.limited);
    },

    styleType: (parent) => {
      return EnumMapper.toStyleTypeEnum(parent.styleType);
    },
  },
};
