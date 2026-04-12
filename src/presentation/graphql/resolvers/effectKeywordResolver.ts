import type { EffectKeywordGroupDTO } from '@/application/dto/EffectKeywordGroupDTO';

import type { GraphQLContext } from '../context';

export const effectKeywordResolvers = {
  Query: {
    skillEffectKeywords: async (
      _parent: unknown,
      _args: Record<string, never>,
      context: GraphQLContext
    ): Promise<EffectKeywordGroupDTO[]> => {
      return context.dataSources.effectKeywordService.getSkillEffectKeywords();
    },

    traitEffectKeywords: async (
      _parent: unknown,
      _args: Record<string, never>,
      context: GraphQLContext
    ): Promise<EffectKeywordGroupDTO[]> => {
      return context.dataSources.effectKeywordService.getTraitEffectKeywords();
    },
  },
};
