import type { Accessory } from './Accessory';
import type { CardDetail } from './CardDetail';
import type { HeartCollectAnalysis, UnDrawAnalysis } from './TraitAnalysis';

export interface Card {
  id: number;
  rarity: string | null;
  limited: string | null;
  cardName: string;
  cardUrl: string | null;
  characterName: string;
  styleType: string | null;
  releaseDate: Date | null;
  isLocked: boolean | null;
  createdAt: Date | null;
  updatedAt: Date | null;
  detail?: CardDetail;
  accessories?: Accessory[];
  heartCollectAnalysis?: HeartCollectAnalysis;
  unDrawAnalysis?: UnDrawAnalysis;
}
