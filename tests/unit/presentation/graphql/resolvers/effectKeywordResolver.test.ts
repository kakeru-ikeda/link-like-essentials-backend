import { requireAuth } from '@/presentation/middleware/authGuard';
import { effectKeywordResolvers } from '@/presentation/graphql/resolvers/effectKeywordResolver';
import type { GraphQLContext } from '@/presentation/graphql/context';

jest.mock('@/presentation/middleware/authGuard', () => ({
  requireAuth: jest.fn(),
}));

describe('effectKeywordResolver', () => {
  let mockContext: GraphQLContext;

  beforeEach(() => {
    mockContext = {
      user: {
        uid: 'test-uid',
        email: 'test@example.com',
        emailVerified: true,
        customClaims: {},
      },
      dataSources: {
        effectKeywordService: {
          getSkillEffectKeywords: jest.fn(),
          getTraitEffectKeywords: jest.fn(),
        },
      },
    } as unknown as GraphQLContext;
  });

  describe('Query.skillEffectKeywords', () => {
    it('requireAuth を呼び出す', async () => {
      (
        mockContext.dataSources.effectKeywordService
          .getSkillEffectKeywords as jest.Mock
      ).mockResolvedValue([]);

      await effectKeywordResolvers.Query.skillEffectKeywords(
        undefined,
        {},
        mockContext
      );

      expect(requireAuth).toHaveBeenCalledWith(mockContext);
    });

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
    it('requireAuth を呼び出す', async () => {
      (
        mockContext.dataSources.effectKeywordService
          .getTraitEffectKeywords as jest.Mock
      ).mockResolvedValue([]);

      await effectKeywordResolvers.Query.traitEffectKeywords(
        undefined,
        {},
        mockContext
      );

      expect(requireAuth).toHaveBeenCalledWith(mockContext);
    });

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
