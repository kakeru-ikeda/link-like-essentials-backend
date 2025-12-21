import type { LiveGrandPrixFilterInput } from '@/application/dto/LiveGrandPrixDTO';
import { requireAuth } from '@/presentation/middleware/authGuard';

import type { GraphQLContext } from '../context';

interface QueryResolvers {
  liveGrandPrix: (
    parent: unknown,
    args: {
      filter?: LiveGrandPrixFilterInput;
    },
    context: GraphQLContext
  ) => Promise<unknown>;
  liveGrandPrixById: (
    parent: unknown,
    args: { id: string },
    context: GraphQLContext
  ) => Promise<unknown>;
  liveGrandPrixByEventName: (
    parent: unknown,
    args: { eventName: string },
    context: GraphQLContext
  ) => Promise<unknown>;
  liveGrandPrixStats: (
    parent: unknown,
    args: Record<string, never>,
    context: GraphQLContext
  ) => Promise<unknown>;
}

export interface LiveGrandPrixResolvers {
  details: (
    parent: { id: number; details?: unknown[] },
    args: Record<string, never>,
    context: GraphQLContext
  ) => unknown[];
}

export interface LiveGrandPrixDetailResolvers {
  sectionEffects: (
    parent: { id: number; sectionEffects?: unknown[] },
    args: Record<string, never>,
    context: GraphQLContext
  ) => unknown[];
  song: (
    parent: { song?: unknown },
    args: Record<string, never>,
    context: GraphQLContext
  ) => unknown;
}

export const liveGrandPrixResolvers: {
  Query: QueryResolvers;
  LiveGrandPrix: LiveGrandPrixResolvers;
  LiveGrandPrixDetail: LiveGrandPrixDetailResolvers;
} = {
  Query: {
    liveGrandPrix: async (_, args, context) => {
      requireAuth(context);

      const { filter } = args;

      const result =
        await context.dataSources.liveGrandPrixService.findAll(filter);

      return result;
    },

    liveGrandPrixById: async (_, { id }, context) => {
      requireAuth(context);

      return await context.dataSources.liveGrandPrixService.findById(
        parseInt(id, 10)
      );
    },

    liveGrandPrixByEventName: async (_, { eventName }, context) => {
      requireAuth(context);

      return await context.dataSources.liveGrandPrixService.findByEventName(
        eventName
      );
    },

    liveGrandPrixStats: async (_, __, context) => {
      requireAuth(context);

      return await context.dataSources.liveGrandPrixService.getStats();
    },
  },

  LiveGrandPrix: {
    details: (parent) => {
      // 事前ロード済みの場合はそれを返す
      if (parent.details) return parent.details;

      // 事前ロードされていない場合は空配列を返す
      return [];
    },
  },

  LiveGrandPrixDetail: {
    sectionEffects: (parent) => {
      // 事前ロード済みの場合はそれを返す
      if (parent.sectionEffects) return parent.sectionEffects;

      // 事前ロードされていない場合は空配列を返す
      return [];
    },

    song: (parent) => {
      // 事前ロード済みの場合はそれを返す
      return parent.song ?? null;
    },
  },
};
