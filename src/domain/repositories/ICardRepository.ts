import type { Card } from '../entities/Card';

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

export interface CardStats {
  totalCards: number;
  byRarity: Array<{ rarity: string; count: number }>;
  byStyleType: Array<{ styleType: string; count: number }>;
  byCharacter: Array<{ characterName: string; count: number }>;
}

export interface ICardRepository {
  findById(id: number): Promise<Card | null>;
  findByCardNameAndCharacter(
    cardName: string,
    characterName: string
  ): Promise<Card | null>;
  findAll(filter?: CardFilterInput): Promise<Card[]>;
  findByIds(ids: number[]): Promise<Card[]>;
  getStats(): Promise<CardStats>;
}
