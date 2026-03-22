import type { EffectKeywordGroup } from '@/infrastructure/database/repositories/EffectKeywordRepository';
import { requireAuth } from '@/presentation/middleware/authGuard';

import type { GraphQLContext } from '../context';

export const effectKeywordResolvers = {
  Query: {
    skillEffectKeywords: async (
      _parent: unknown,
      _args: Record<string, never>,
      context: GraphQLContext
    ): Promise<EffectKeywordGroup[]> => {
      requireAuth(context);
      return context.dataSources.effectKeywordRepository.getSkillEffectKeywords();
    },

    traitEffectKeywords: async (
      _parent: unknown,
      _args: Record<string, never>,
      context: GraphQLContext
    ): Promise<EffectKeywordGroup[]> => {
      requireAuth(context);
      return context.dataSources.effectKeywordRepository.getTraitEffectKeywords();
    },
  },
};
