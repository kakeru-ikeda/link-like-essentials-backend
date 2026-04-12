import { effectKeywordResolvers } from '@/presentation/graphql/resolvers/effectKeywordResolver';
import type { GraphQLContext } from '@/presentation/graphql/context';

describe('effectKeywordResolver', () => {
  let mockContext: GraphQLContext;

  beforeEach(() => {
    mockContext = {
      dataSources: {
        effectKeywordService: {
          getSkillEffectKeywords: jest.fn(),
          getTraitEffectKeywords: jest.fn(),
        },
      },
    } as unknown as GraphQLContext;
  });

  describe('Query.skillEffectKeywords', () => {
    it('effectKeywordService.getSkillEffectKeywords に委譲する', async () => {
      const mockResult = [
        {
          effectType: 'SCORE_UP',
          label: 'スコアアップ',
          description: 'スコアを増加',
          keywords: ['スコアを\\d+%増加'],
        },
      ];
      (
        mockContext.dataSources.effectKeywordService
          .getSkillEffectKeywords as jest.Mock
      ).mockResolvedValue(mockResult);

      const result = await effectKeywordResolvers.Query.skillEffectKeywords(
        undefined,
        {},
        mockContext
      );

      expect(
        mockContext.dataSources.effectKeywordService.getSkillEffectKeywords
      ).toHaveBeenCalledTimes(1);
      expect(result).toEqual(mockResult);
    });
  });

  describe('Query.traitEffectKeywords', () => {
    it('effectKeywordService.getTraitEffectKeywords に委譲する', async () => {
      const mockResult = [
        {
          effectType: 'HEART_COLLECT',
          label: 'ハートコレクト',
          description: 'ハートを回収',
          keywords: ['ハートコレクト'],
        },
      ];
      (
        mockContext.dataSources.effectKeywordService
          .getTraitEffectKeywords as jest.Mock
      ).mockResolvedValue(mockResult);

      const result = await effectKeywordResolvers.Query.traitEffectKeywords(
        undefined,
        {},
        mockContext
      );

      expect(
        mockContext.dataSources.effectKeywordService.getTraitEffectKeywords
      ).toHaveBeenCalledTimes(1);
      expect(result).toEqual(mockResult);
    });
  });
});
