import type { CardFilterInput, CardSortInput } from '@/application/dto/CardDTO';
import { EnumMapper } from '@/infrastructure/mappers/EnumMapper';

import type { GraphQLContext } from '../context';

interface QueryResolvers {
  cards: (
    parent: unknown,
    args: {
      first?: number;
      after?: string;
      filter?: CardFilterInput;
      sort?: CardSortInput;
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
    parent: { id: number },
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
      const { first, after, filter, sort } = args;

      const result = await context.dataSources.cardService.findAll(
        filter,
        sort,
        { first, after }
      );

      return result;
    },

    card: async (_, { id }, context) => {
      return await context.dataSources.cardService.findById(parseInt(id, 10));
    },

    cardByName: async (_, { cardName, characterName }, context) => {
      return await context.dataSources.cardService.findByName(
        cardName,
        characterName
      );
    },

    cardStats: async (_, __, context) => {
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
