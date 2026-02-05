import type {
  CreateCardInput as MutationCreateCardInput,
  UpdateCardInput as MutationUpdateCardInput,
} from './MutationDTO';

export interface CardFilterInput {
  rarity?: string;
  limited?: string;
  characterName?: string;
  styleType?: string;
  cardName?: string;
  skillEffectContains?: string;
  traitEffectContains?: string;
  specialAppealEffectContains?: string;
  accessoryEffectContains?: string;
}

export interface CardStatsResult {
  totalCards: number;
  byRarity: RarityCount[];
  byStyleType: StyleTypeCount[];
  byCharacter: CharacterCount[];
}

export interface RarityCount {
  rarity: string;
  count: number;
}

export interface StyleTypeCount {
  styleType: string;
  count: number;
}

export interface CharacterCount {
  characterName: string;
  count: number;
}

export interface DeleteResponse {
  success: boolean;
  message: string;
}

export type CreateCardInput = MutationCreateCardInput;
export type UpdateCardInput = MutationUpdateCardInput;
