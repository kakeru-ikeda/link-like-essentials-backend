import type {
  HeartCollectAnalysis,
  UnDrawAnalysis,
} from '@/domain/entities/TraitAnalysis';
import { requireAuth } from '@/presentation/middleware/authGuard';

import type { GraphQLContext } from '../context';

export interface TraitAnalysisInput {
  cardId: number;
}

export interface TraitAnalysisResult {
  cardId: number;
  heartCollect: HeartCollectAnalysis | null;
  unDraw: UnDrawAnalysis | null;
}

export interface SectionActivation {
  section1: boolean;
  section2: boolean;
  section3: boolean;
  section4: boolean;
  section5: boolean;
  sectionFever: boolean;
}

export const traitAnalysisResolvers = {
  Query: {
    traitAnalysisBatch: async (
      _parent: unknown,
      args: { inputs: TraitAnalysisInput[] },
      context: GraphQLContext
    ): Promise<TraitAnalysisResult[]> => {
      requireAuth(context);

      const { inputs } = args;

      // Promise.allで並列取得
      const results: TraitAnalysisResult[] = await Promise.all(
        inputs.map(async (input): Promise<TraitAnalysisResult> => {
          const [heartCollect, unDraw] = await Promise.all([
            context.dataSources.heartCollectAnalysisService.findByCardId(
              input.cardId
            ),
            context.dataSources.unDrawAnalysisService.findByCardId(
              input.cardId
            ),
          ]);

          return {
            cardId: input.cardId,
            heartCollect,
            unDraw,
          };
        })
      );

      return results;
    },
  },
  HeartCollectAnalysis: {
    sections: (parent: HeartCollectAnalysis): SectionActivation => {
      // エンティティのフラットな構造をGraphQLのネストされた構造に変換
      return {
        section1: parent.section1,
        section2: parent.section2,
        section3: parent.section3,
        section4: parent.section4,
        section5: parent.section5,
        sectionFever: parent.sectionFever,
      };
    },
  },
  UnDrawAnalysis: {
    sections: (parent: UnDrawAnalysis): SectionActivation => {
      // エンティティのフラットな構造をGraphQLのネストされた構造に変換
      return {
        section1: parent.section1,
        section2: parent.section2,
        section3: parent.section3,
        section4: parent.section4,
        section5: parent.section5,
        sectionFever: parent.sectionFever,
      };
    },
  },
} as const;
