import type {
  HeartCollectAnalysis,
  UnDrawAnalysis,
} from '../entities/TraitAnalysis';

export interface IHeartCollectAnalysisRepository {
  findByCardId(cardId: number): Promise<HeartCollectAnalysis | null>;
  findByAccessoryId(accessoryId: number): Promise<HeartCollectAnalysis | null>;
}

export interface IUnDrawAnalysisRepository {
  findByCardId(cardId: number): Promise<UnDrawAnalysis | null>;
  findByAccessoryId(accessoryId: number): Promise<UnDrawAnalysis | null>;
}
