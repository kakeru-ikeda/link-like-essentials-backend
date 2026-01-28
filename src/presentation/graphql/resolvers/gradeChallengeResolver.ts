import type { GradeChallengeFilterInput } from '@/application/dto/GradeChallengeDTO';
import { requireAuth } from '@/presentation/middleware/authGuard';

import type { GraphQLContext } from '../context';

interface QueryResolvers {
  gradeChallenges: (
    parent: unknown,
    args: { filter?: GradeChallengeFilterInput },
    context: GraphQLContext
  ) => Promise<unknown>;
  gradeChallengeById: (
    parent: unknown,
    args: { id: string },
    context: GraphQLContext
  ) => Promise<unknown>;
  gradeChallengeByTitle: (
    parent: unknown,
    args: { title: string },
    context: GraphQLContext
  ) => Promise<unknown>;
  ongoingGradeChallenges: (
    parent: unknown,
    args: Record<string, never>,
    context: GraphQLContext
  ) => Promise<unknown>;
  gradeChallengeStats: (
    parent: unknown,
    args: Record<string, never>,
    context: GraphQLContext
  ) => Promise<unknown>;
}

export interface GradeChallengeResolvers {
  details: (
    parent: { id: number; details?: unknown[] },
    args: Record<string, never>,
    context: GraphQLContext
  ) => unknown[];
}

export interface GradeChallengeDetailResolvers {
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

export const gradeChallengeResolvers: {
  Query: QueryResolvers;
  GradeChallenge: GradeChallengeResolvers;
  GradeChallengeDetail: GradeChallengeDetailResolvers;
} = {
  Query: {
    gradeChallenges: async (_, args, context) => {
      requireAuth(context);

      const { filter } = args;

      return await context.dataSources.gradeChallengeService.findAll(filter);
    },

    gradeChallengeById: async (_, { id }, context) => {
      requireAuth(context);

      return await context.dataSources.gradeChallengeService.findById(
        parseInt(id, 10)
      );
    },

    gradeChallengeByTitle: async (_, { title }, context) => {
      requireAuth(context);

      return await context.dataSources.gradeChallengeService.findByTitle(title);
    },

    ongoingGradeChallenges: async (_, __, context) => {
      requireAuth(context);

      return await context.dataSources.gradeChallengeService.findOngoing();
    },

    gradeChallengeStats: async (_, __, context) => {
      requireAuth(context);

      return await context.dataSources.gradeChallengeService.getStats();
    },
  },

  GradeChallenge: {
    details: (parent) => {
      if (parent.details) return parent.details;

      return [];
    },
  },

  GradeChallengeDetail: {
    sectionEffects: (parent) => {
      if (parent.sectionEffects) return parent.sectionEffects;

      return [];
    },

    song: (parent) => {
      return parent.song ?? null;
    },
  },
};
