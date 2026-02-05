import { Kind, type GraphQLResolveInfo, type SelectionNode } from 'graphql';

import type { CardFilterInput } from '@/application/dto/CardDTO';
import type { PaginationInput } from '@/application/dto/PaginationDTO';
import { EnumMapper } from '@/infrastructure/mappers/EnumMapper';
import { requireAuth } from '@/presentation/middleware/authGuard';

import type { GraphQLContext } from '../context';

interface QueryResolvers {
  cards: (
    parent: unknown,
    args: {
      filter?: CardFilterInput;
    },
    context: GraphQLContext,
    info: GraphQLResolveInfo
  ) => Promise<unknown>;
  cardsConnection: (
    parent: unknown,
    args: {
      filter?: CardFilterInput;
      first?: number;
      after?: string;
    },
    context: GraphQLContext,
    info: GraphQLResolveInfo
  ) => Promise<unknown>;
  card: (
    parent: unknown,
    args: { id: string },
    context: GraphQLContext,
    info: GraphQLResolveInfo
  ) => Promise<unknown>;
  cardByName: (
    parent: unknown,
    args: { cardName: string; characterName: string },
    context: GraphQLContext,
    info: GraphQLResolveInfo
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
  heartCollectAnalysis: (
    parent: { id: number; heartCollectAnalysis?: unknown },
    args: Record<string, never>,
    context: GraphQLContext
  ) => Promise<unknown>;
  unDrawAnalysis: (
    parent: { id: number; unDrawAnalysis?: unknown },
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
    cards: async (_, args, context, info) => {
      requireAuth(context);

      const { filter } = args;

      const includeOptions = getCardIncludeOptions(info);
      const result = await context.dataSources.cardService.findAll(
        filter,
        includeOptions
      );

      return result;
    },

    cardsConnection: async (_, args, context, info) => {
      requireAuth(context);

      const { filter, first, after } = args;
      const pagination: PaginationInput = { first, after };

      const includeOptions = getCardIncludeOptions(info);
      const result = await context.dataSources.cardService.findAllPaginated(
        filter,
        pagination,
        includeOptions
      );

      return result;
    },

    card: async (_, { id }, context, info) => {
      requireAuth(context);

      const includeOptions = getCardIncludeOptions(info);
      return await context.dataSources.cardService.findById(
        parseInt(id, 10),
        includeOptions
      );
    },

    cardByName: async (_, { cardName, characterName }, context, info) => {
      requireAuth(context);

      return await context.dataSources.cardService.findByName(
        cardName,
        characterName,
        getCardIncludeOptions(info)
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

    heartCollectAnalysis: async (parent, _, context) => {
      if (parent.heartCollectAnalysis) return parent.heartCollectAnalysis;

      return await context.dataSources.heartCollectAnalysisService.findByCardId(
        parent.id
      );
    },

    unDrawAnalysis: async (parent, _, context) => {
      if (parent.unDrawAnalysis) return parent.unDrawAnalysis;

      return await context.dataSources.unDrawAnalysisService.findByCardId(
        parent.id
      );
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

const getCardIncludeOptions = (
  info: GraphQLResolveInfo
): {
  heartCollectAnalysis: boolean;
  unDrawAnalysis: boolean;
} => {
  return {
    heartCollectAnalysis: hasSelectedField(info, 'heartCollectAnalysis'),
    unDrawAnalysis: hasSelectedField(info, 'unDrawAnalysis'),
  };
};

const hasSelectedField = (
  info: GraphQLResolveInfo,
  fieldName: string
): boolean => {
  const selections = info.fieldNodes.flatMap(
    (node) => node.selectionSet?.selections ?? []
  );
  return selectionsContainField(
    selections,
    fieldName,
    info.fragments,
    new Set<string>()
  );
};

const selectionsContainField = (
  selections: readonly SelectionNode[],
  fieldName: string,
  fragments: GraphQLResolveInfo['fragments'],
  visitedFragments: Set<string>
): boolean => {
  for (const selection of selections) {
    if (selection.kind === Kind.FIELD) {
      if (selection.name.value === fieldName) {
        return true;
      }
      continue;
    }

    if (selection.kind === Kind.INLINE_FRAGMENT) {
      if (
        selection.selectionSet &&
        selectionsContainField(
          selection.selectionSet.selections,
          fieldName,
          fragments,
          visitedFragments
        )
      ) {
        return true;
      }
      continue;
    }

    if (selection.kind === Kind.FRAGMENT_SPREAD) {
      const fragmentName = selection.name.value;
      if (visitedFragments.has(fragmentName)) {
        continue;
      }
      visitedFragments.add(fragmentName);
      const fragment = fragments[fragmentName];
      if (
        fragment?.selectionSet &&
        selectionsContainField(
          fragment.selectionSet.selections,
          fieldName,
          fragments,
          visitedFragments
        )
      ) {
        return true;
      }
    }
  }

  return false;
};
