import type { EffectKeywordGroupDTO } from '@/application/dto/EffectKeywordGroupDTO';
import { requireAuth } from '@/presentation/middleware/authGuard';

import type { GraphQLContext } from '../context';

export const effectKeywordResolvers = {
  Query: {
    skillEffectKeywords: async (
      _parent: unknown,
      _args: Record<string, never>,
      context: GraphQLContext
    ): Promise<EffectKeywordGroupDTO[]> => {
      requireAuth(context);
      return context.dataSources.effectKeywordService.getSkillEffectKeywords();
    },

    traitEffectKeywords: async (
      _parent: unknown,
      _args: Record<string, never>,
      context: GraphQLContext
    ): Promise<EffectKeywordGroupDTO[]> => {
      requireAuth(context);
      return context.dataSources.effectKeywordService.getTraitEffectKeywords();
    },
  },
};
